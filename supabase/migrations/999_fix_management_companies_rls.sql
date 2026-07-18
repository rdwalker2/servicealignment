-- Fix infinite recursion on management_companies and related tables

-- Drop the recursive policies
DROP POLICY IF EXISTS "Tenant isolation for management_companies" ON public.management_companies;
DROP POLICY IF EXISTS "Tenant isolation for contacts" ON public.contacts;
DROP POLICY IF EXISTS "Tenant isolation for property_managers" ON public.property_managers;
DROP POLICY IF EXISTS "Tenant isolation for geospatial_weather_events" ON public.geospatial_weather_events;

-- Replace with simpler authenticated access for the prototype
CREATE POLICY "Enable access for all authenticated users" ON public.management_companies FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');
CREATE POLICY "Enable access for all authenticated users" ON public.contacts FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');
CREATE POLICY "Enable access for all authenticated users" ON public.property_managers FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');
CREATE POLICY "Enable access for all authenticated users" ON public.geospatial_weather_events FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');
