
CREATE OR REPLACE VIEW public.daily_analytics AS
SELECT
    date_trunc('day', created_at)::date AS day,
    currency,
    SUM(amount) AS total_amount_cents,
    COUNT(id) AS total_paid_orders,
    COUNT(DISTINCT booking_id) AS total_booked_trips
FROM
    orders
WHERE
    status = 'paid' AND booking_id IS NOT NULL
GROUP BY
    day, currency
ORDER BY
    day DESC;
