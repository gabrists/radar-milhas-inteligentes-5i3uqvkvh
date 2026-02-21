CREATE POLICY "Authenticated users can insert active promotions" ON public.active_promotions
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update active promotions" ON public.active_promotions
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete active promotions" ON public.active_promotions
  FOR DELETE TO authenticated USING (true);
