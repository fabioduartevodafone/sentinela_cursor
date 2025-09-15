-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('citizen', 'agent', 'admin')),
  is_approved BOOLEAN DEFAULT false,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create incidents table
CREATE TABLE public.incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  type TEXT NOT NULL CHECK (type IN ('crime_violence', 'accident_traffic', 'accident_work', 'accident_domestic', 'risk_alert')),
  subtype TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  is_anonymous BOOLEAN DEFAULT false,
  reporter_name TEXT,
  reporter_phone TEXT,
  incident_date DATE NOT NULL,
  incident_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create protective_measures table
CREATE TABLE public.protective_measures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID,
  subject_name TEXT NOT NULL,
  subject_document TEXT NOT NULL,
  restriction_type TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'expired')),
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agents table
CREATE TABLE public.agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  badge_number TEXT NOT NULL UNIQUE,
  department TEXT NOT NULL,
  rank TEXT,
  specialization TEXT[],
  is_active BOOLEAN DEFAULT true,
  current_location_lat DECIMAL(10, 8),
  current_location_lng DECIMAL(11, 8),
  last_location_update TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vehicles table
CREATE TABLE public.vehicles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('car', 'motorcycle')),
  license_plate TEXT NOT NULL UNIQUE,
  model TEXT NOT NULL,
  year INTEGER,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance', 'out_of_service')),
  current_location_lat DECIMAL(10, 8),
  current_location_lng DECIMAL(11, 8),
  last_location_update TIMESTAMP WITH TIME ZONE,
  assigned_agent_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create crime_statistics table for heatmap data
CREATE TABLE public.crime_statistics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  location_lat DECIMAL(10, 8) NOT NULL,
  location_lng DECIMAL(11, 8) NOT NULL,
  crime_type TEXT NOT NULL,
  incident_count INTEGER NOT NULL DEFAULT 1,
  month_year TEXT NOT NULL,
  area_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protective_measures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crime_statistics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create RLS policies for incidents
CREATE POLICY "Users can view all incidents" ON public.incidents FOR SELECT USING (true);
CREATE POLICY "Users can create incidents" ON public.incidents FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own incidents" ON public.incidents FOR UPDATE USING (user_id = auth.uid());

-- Create RLS policies for protective measures
CREATE POLICY "Users can view their own measures" ON public.protective_measures FOR SELECT USING (requester_id = auth.uid());
CREATE POLICY "Users can create protective measures" ON public.protective_measures FOR INSERT WITH CHECK (requester_id = auth.uid());
CREATE POLICY "Admins can view all measures" ON public.protective_measures FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Create RLS policies for agents
CREATE POLICY "Everyone can view agents" ON public.agents FOR SELECT USING (true);
CREATE POLICY "Admins can manage agents" ON public.agents FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Create RLS policies for vehicles
CREATE POLICY "Everyone can view vehicles" ON public.vehicles FOR SELECT USING (true);
CREATE POLICY "Agents and admins can manage vehicles" ON public.vehicles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('agent', 'admin'))
);

-- Create RLS policies for crime statistics
CREATE POLICY "Everyone can view crime statistics" ON public.crime_statistics FOR SELECT USING (true);
CREATE POLICY "Admins can manage crime statistics" ON public.crime_statistics FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Insert test users
INSERT INTO public.profiles (user_id, full_name, email, phone, role, is_approved) VALUES
('00000000-0000-0000-0000-000000000001', 'João Silva', 'joao@cidadao.com', '(11) 99999-0001', 'citizen', true),
('00000000-0000-0000-0000-000000000002', 'Maria Santos', 'maria@cidadao.com', '(11) 99999-0002', 'citizen', true),
('00000000-0000-0000-0000-000000000003', 'Pedro Oliveira', 'pedro@cidadao.com', '(11) 99999-0003', 'citizen', true),
('00000000-0000-0000-0000-000000000004', 'Ana Costa', 'ana@cidadao.com', '(11) 99999-0004', 'citizen', true),
('00000000-0000-0000-0000-000000000005', 'Carlos Mendes', 'carlos@cidadao.com', '(11) 99999-0005', 'citizen', true),
('00000000-0000-0000-0000-000000000010', 'Agente Carlos', 'carlos@agente.com', '(11) 98888-0001', 'agent', true),
('00000000-0000-0000-0000-000000000011', 'Agente Marina', 'marina@agente.com', '(11) 98888-0002', 'agent', true),
('00000000-0000-0000-0000-000000000012', 'Agente Roberto', 'roberto@agente.com', '(11) 98888-0003', 'agent', true),
('00000000-0000-0000-0000-000000000013', 'Agente Lucia', 'lucia@agente.com', '(11) 98888-0004', 'agent', true),
('00000000-0000-0000-0000-000000000014', 'Agente Fernando', 'fernando@agente.com', '(11) 98888-0005', 'agent', true),
('00000000-0000-0000-0000-000000000020', 'Admin Master', 'admin@master.com', '(11) 97777-0001', 'admin', true),
('00000000-0000-0000-0000-000000000021', 'Admin Sistema', 'admin@sistema.com', '(11) 97777-0002', 'admin', true);

-- Insert test agents
INSERT INTO public.agents (user_id, badge_number, department, rank, specialization, current_location_lat, current_location_lng, last_location_update) VALUES
('00000000-0000-0000-0000-000000000010', 'AG001', 'Segurança Pública', 'Soldado', ARRAY['Patrulhamento', 'Trânsito'], -23.5505, -46.6333, now()),
('00000000-0000-0000-0000-000000000011', 'AG002', 'Segurança Pública', 'Cabo', ARRAY['Investigação', 'Crimes'], -23.5489, -46.6388, now()),
('00000000-0000-0000-0000-000000000012', 'AG003', 'Bombeiros', 'Sargento', ARRAY['Emergências', 'Acidentes'], -23.5520, -46.6370, now()),
('00000000-0000-0000-0000-000000000013', 'AG004', 'Segurança Pública', 'Soldado', ARRAY['Patrulhamento', 'Prevenção'], -23.5475, -46.6420, now()),
('00000000-0000-0000-0000-000000000014', 'AG005', 'Defesa Civil', 'Tenente', ARRAY['Riscos', 'Estruturas'], -23.5540, -46.6310, now());

-- Insert test vehicles
INSERT INTO public.vehicles (vehicle_type, license_plate, model, year, status, current_location_lat, current_location_lng, assigned_agent_id, last_location_update) VALUES
('car', 'ABC-1234', 'Chevrolet Prisma', 2022, 'in_use', -23.5505, -46.6333, '00000000-0000-0000-0000-000000000010', now()),
('motorcycle', 'MOT-5678', 'Honda CG 160', 2023, 'in_use', -23.5489, -46.6388, '00000000-0000-0000-0000-000000000011', now()),
('car', 'DEF-9012', 'Volkswagen Gol', 2021, 'available', -23.5520, -46.6370, NULL, now()),
('motorcycle', 'MOT-3456', 'Yamaha Factor', 2022, 'in_use', -23.5475, -46.6420, '00000000-0000-0000-0000-000000000013', now()),
('car', 'GHI-7890', 'Fiat Argo', 2023, 'maintenance', -23.5540, -46.6310, NULL, now()),
('motorcycle', 'MOT-1122', 'Honda CB 600F', 2021, 'available', -23.5560, -46.6290, NULL, now()),
('car', 'JKL-3344', 'Renault Logan', 2020, 'in_use', -23.5450, -46.6450, '00000000-0000-0000-0000-000000000014', now());

-- Insert test incidents
INSERT INTO public.incidents (user_id, type, subtype, title, description, location, latitude, longitude, status, priority, incident_date, incident_time, reporter_name, reporter_phone) VALUES
('00000000-0000-0000-0000-000000000001', 'crime_violence', 'roubo', 'Roubo de celular', 'Indivíduo abordou vítima e levou celular na Rua das Flores', 'Rua das Flores, 123 - Centro', -23.5505, -46.6333, 'investigating', 'high', '2024-01-15', '14:30:00', 'João Silva', '(11) 99999-0001'),
('00000000-0000-0000-0000-000000000002', 'accident_traffic', 'colisao', 'Colisão entre carros', 'Acidente entre dois carros no cruzamento da Av. Paulista', 'Av. Paulista com Rua Augusta', -23.5489, -46.6388, 'resolved', 'medium', '2024-01-14', '16:45:00', 'Maria Santos', '(11) 99999-0002'),
(NULL, 'risk_alert', 'fios_eletricos', 'Fios elétricos soltos', 'Fios de alta tensão estão balançando perigosamente na rua', 'Rua dos Electricistas, 456', -23.5520, -46.6370, 'pending', 'critical', '2024-01-15', '08:15:00', 'Anônimo', NULL),
('00000000-0000-0000-0000-000000000003', 'crime_violence', 'furto', 'Furto em residência', 'Casa foi invadida durante a madrugada, levaram eletrônicos', 'Rua das Palmeiras, 789', -23.5475, -46.6420, 'pending', 'high', '2024-01-13', '03:20:00', 'Pedro Oliveira', '(11) 99999-0003'),
('00000000-0000-0000-0000-000000000004', 'accident_work', 'queda', 'Queda em obra', 'Trabalhador caiu de andaime em construção', 'Rua da Construção, 321', -23.5540, -46.6310, 'investigating', 'high', '2024-01-15', '10:00:00', 'Ana Costa', '(11) 99999-0004'),
('00000000-0000-0000-0000-000000000005', 'risk_alert', 'alagamento', 'Ponto de alagamento', 'Rua alaga sempre que chove forte, risco para pedestres', 'Rua do Rio, 654', -23.5560, -46.6290, 'pending', 'medium', '2024-01-14', '12:30:00', 'Carlos Mendes', '(11) 99999-0005'),
(NULL, 'crime_violence', 'violencia_domestica', 'Violência doméstica', 'Vizinhos relatam gritos e discussões frequentes', 'Rua da Paz, 147', -23.5450, -46.6450, 'investigating', 'critical', '2024-01-15', '22:15:00', 'Anônimo', NULL),
('00000000-0000-0000-0000-000000000001', 'accident_domestic', 'incendio', 'Princípio de incêndio', 'Fogo iniciou na cozinha, controlado pelos moradores', 'Rua do Fogo, 258', -23.5530, -46.6350, 'resolved', 'high', '2024-01-12', '19:45:00', 'João Silva', '(11) 99999-0001'),
('00000000-0000-0000-0000-000000000002', 'risk_alert', 'ma_iluminacao', 'Rua sem iluminação', 'Postes queimados deixam rua muito escura à noite', 'Rua Escura, 369', -23.5485, -46.6400, 'pending', 'medium', '2024-01-14', '20:00:00', 'Maria Santos', '(11) 99999-0002'),
('00000000-0000-0000-0000-000000000003', 'risk_alert', 'estrutura_risco', 'Prédio com rachaduras', 'Edifício apresenta rachaduras nas paredes externas', 'Av. dos Prédios, 741', -23.5510, -46.6380, 'investigating', 'high', '2024-01-13', '15:30:00', 'Pedro Oliveira', '(11) 99999-0003');

-- Insert test protective measures
INSERT INTO public.protective_measures (requester_id, subject_name, subject_document, restriction_type, description, location, start_date, end_date, status, approved_by, approved_at) VALUES
('00000000-0000-0000-0000-000000000001', 'José da Silva', '123.456.789-00', 'Distanciamento', 'Manter distância mínima de 200m da vítima', 'Bairro Centro', '2024-01-10', '2024-07-10', 'active', '00000000-0000-0000-0000-000000000020', '2024-01-11 14:30:00'),
('00000000-0000-0000-0000-000000000002', 'Maria Ferreira', '987.654.321-00', 'Proibição de contato', 'Proibido qualquer tipo de contato com a vítima', 'Bairro Vila Nova', '2024-01-12', '2024-12-12', 'active', '00000000-0000-0000-0000-000000000020', '2024-01-13 09:15:00'),
('00000000-0000-0000-0000-000000000003', 'Carlos Oliveira', '456.789.123-00', 'Distanciamento', 'Não pode se aproximar da residência da vítima', 'Rua das Flores, 123', '2024-01-15', '2024-06-15', 'pending', NULL, NULL),
('00000000-0000-0000-0000-000000000004', 'Roberto Santos', '789.123.456-00', 'Monitoramento eletrônico', 'Uso obrigatório de tornozeleira eletrônica', 'Bairro São João', '2024-01-08', '2024-08-08', 'active', '00000000-0000-0000-0000-000000000021', '2024-01-09 16:45:00');

-- Insert crime statistics for heatmap (last 3 months)
INSERT INTO public.crime_statistics (location_lat, location_lng, crime_type, incident_count, month_year, area_name) VALUES
-- Janeiro 2024
(-23.5505, -46.6333, 'roubo', 5, '2024-01', 'Centro'),
(-23.5489, -46.6388, 'furto', 3, '2024-01', 'Paulista'),
(-23.5520, -46.6370, 'violencia', 2, '2024-01', 'Jardins'),
(-23.5475, -46.6420, 'roubo', 4, '2024-01', 'Vila Madalena'),
(-23.5540, -46.6310, 'furto', 6, '2024-01', 'Pinheiros'),
-- Dezembro 2023
(-23.5505, -46.6333, 'roubo', 7, '2023-12', 'Centro'),
(-23.5489, -46.6388, 'furto', 4, '2023-12', 'Paulista'),
(-23.5520, -46.6370, 'violencia', 3, '2023-12', 'Jardins'),
(-23.5475, -46.6420, 'roubo', 5, '2023-12', 'Vila Madalena'),
(-23.5540, -46.6310, 'furto', 8, '2023-12', 'Pinheiros'),
-- Novembro 2023
(-23.5505, -46.6333, 'roubo', 6, '2023-11', 'Centro'),
(-23.5489, -46.6388, 'furto', 5, '2023-11', 'Paulista'),
(-23.5520, -46.6370, 'violencia', 1, '2023-11', 'Jardins'),
(-23.5475, -46.6420, 'roubo', 3, '2023-11', 'Vila Madalena'),
(-23.5540, -46.6310, 'furto', 7, '2023-11', 'Pinheiros');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON public.incidents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_protective_measures_updated_at BEFORE UPDATE ON public.protective_measures FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON public.agents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();