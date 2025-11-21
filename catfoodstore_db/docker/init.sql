-- ===============================
-- ตารางอาหารแมว (แก้ไขแล้ว ใช้งานได้จริง)
-- ===============================

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    weight VARCHAR(50),
    age_group VARCHAR(20) CHECK (age_group IN ('kitten', 'adult', 'special_care')),
    breed_type VARCHAR[] DEFAULT ARRAY['all'],
    category VARCHAR(20) CHECK (category IN ('dry', 'wet', 'snack')),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- trigger update updated_at
-- ===============================
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_products_modtime
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- ===============================
-- ตัวอย่างข้อมูลเริ่มต้น
-- ===============================
INSERT INTO products 
(name, description, price, weight, age_group, breed_type, category, image_url)
VALUES
(
    'Royal Canin Kitten',
    'อาหารแมวแบบเม็ดสูตรลูกแมว อายุ 2–12 เดือน',
    450.00,
    '1kg',
    'kitten',
    '{"all"}',
    'dry',
    'https://example.com/rc-kitten.jpg'
),
(
    'Purina One Adult Chicken',
    'อาหารแมวโต สูตรไก่ โปรตีนสูง',
    389.00,
    '1.3kg',
    'adult',
    '{"เปอร์เซีย","บริติชช็อตแฮร์"}',
    'dry',
    'https://example.com/purina-adult.jpg'
),
(
    'Royal Canin Urinary Care',
    'สูตรดูแลปัญหาระบบปัสสาวะ เหมาะสำหรับแมวต้องดูแลพิเศษ',
    520.00,
    '400g',
    'special_care',
    '{"all"}',
    'dry',
    'https://example.com/rc-urinary.jpg'
);
