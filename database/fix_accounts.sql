DO $$ 
DECLARE 
    customer_record RECORD;
    random_acc VARCHAR;
    random_iban VARCHAR;
BEGIN 
    FOR customer_record IN SELECT id FROM users WHERE role_code = 'CUSTOMER' LOOP
        -- Eğer TRY hesabı yoksa 10.000 TL'lik bir hesap oluştur
        IF NOT EXISTS (SELECT 1 FROM accounts WHERE user_id = customer_record.id AND currency = 'TRY') THEN
            random_acc := '100' || floor(random() * 89999999 + 10000000)::text;
            random_iban := 'TR' || floor(random() * 89 + 10)::text || '000610' || floor(random() * 89999999 + 10000000)::text || floor(random() * 8999999 + 1000000)::text;
            
            INSERT INTO accounts (user_id, account_type, currency, account_number, iban, balance, is_active, created_at)
            VALUES (customer_record.id, 'VADESIZ_TL', 'TRY', random_acc, random_iban, 10000.00, true, NOW());
        END IF;
    END LOOP; 
END $$;
