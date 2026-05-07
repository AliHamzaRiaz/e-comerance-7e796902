create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users view own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);
create policy "Admins view all roles" on public.user_roles for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins manage roles" on public.user_roles for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  phone text,
  address_line1 text,
  address_line2 text,
  city text,
  postal_code text,
  country text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "Profiles viewable by owner" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "Profiles updatable by owner" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "Profiles insertable by owner" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "Admins view all profiles" on public.profiles for select to authenticated using (public.has_role(auth.uid(), 'admin'));

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'), new.raw_user_meta_data->>'avatar_url');
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  return new;
end; $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  category text not null,
  image_url text,
  tag text,
  sizes text[] not null default '{}',
  stock integer not null default 100,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.products enable row level security;

create policy "Public can view active products" on public.products for select using (active = true);
create policy "Admins view all products" on public.products for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins manage products" on public.products for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create trigger products_updated_at before update on public.products
for each row execute function public.set_updated_at();

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  size text not null,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (user_id, product_id, size)
);
alter table public.cart_items enable row level security;

create policy "Cart owner full access" on public.cart_items for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create type public.order_status as enum ('pending', 'paid', 'shipped', 'cancelled');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  status order_status not null default 'pending',
  total numeric(10,2) not null,
  shipping_address jsonb,
  stripe_session_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.orders enable row level security;

create policy "Users view own orders" on public.orders for select to authenticated using (auth.uid() = user_id);
create policy "Users insert own orders" on public.orders for insert to authenticated with check (auth.uid() = user_id);
create policy "Admins view all orders" on public.orders for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins update orders" on public.orders for update to authenticated using (public.has_role(auth.uid(), 'admin'));

create trigger orders_updated_at before update on public.orders
for each row execute function public.set_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_image text,
  size text not null,
  quantity integer not null,
  unit_price numeric(10,2) not null
);
alter table public.order_items enable row level security;

create policy "Users view own order items" on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "Users insert own order items" on public.order_items for insert to authenticated
  with check (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "Admins view all order items" on public.order_items for select to authenticated using (public.has_role(auth.uid(), 'admin'));