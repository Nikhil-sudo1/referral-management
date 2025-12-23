-- Stored Procedure: Get Referrer Leaderboard
-- Fetches leaderboard data from referrals table
-- Shows referrer name, referral code, total referrals, admitted count, conversion rate, and rank
-- Ranked by total referrals (highest = rank 1)

CREATE OR REPLACE FUNCTION get_referrer_leaderboard(
    p_period VARCHAR DEFAULT 'all_time',
    p_limit INTEGER DEFAULT 50,
    p_user_type_id INTEGER DEFAULT 2
)
RETURNS TABLE (
    rank INTEGER,
    referrer_id UUID,
    referrer_name VARCHAR,
    referrer_code VARCHAR,
    total_referrals BIGINT,
    admitted_referrals BIGINT,
    conversion_rate NUMERIC,
    referrer_email VARCHAR
) 
LANGUAGE plpgsql
AS $$
DECLARE
    v_date_filter TIMESTAMP;
BEGIN
    -- Set date filter based on period
    IF p_period = 'monthly' THEN
        v_date_filter := DATE_TRUNC('month', CURRENT_TIMESTAMP);
    ELSIF p_period = 'weekly' THEN
        v_date_filter := CURRENT_TIMESTAMP - INTERVAL '7 days';
    ELSE
        v_date_filter := NULL; -- all_time
    END IF;

    RETURN QUERY
    WITH referral_stats AS (
        SELECT 
            r.referrer_id,
            COUNT(r.id) AS total_count,
            COUNT(CASE 
                WHEN r.status = 'admitted' THEN 1 
                ELSE NULL 
            END) AS admitted_count
        FROM referrals r
        WHERE r.referrer_id IS NOT NULL
            AND (v_date_filter IS NULL OR r.submission_date >= v_date_filter)
        GROUP BY r.referrer_id
    ),
    ranked_referrers AS (
        SELECT 
            rs.referrer_id,
            u.full_name AS referrer_name,
            u.referral_code AS referrer_code,
            u.email AS referrer_email,
            rs.total_count AS total_referrals,
            rs.admitted_count AS admitted_referrals,
            CASE 
                WHEN rs.total_count > 0 THEN 
                    ROUND((rs.admitted_count::NUMERIC / rs.total_count::NUMERIC) * 100, 2)
                ELSE 0
            END AS conversion_rate,
            ROW_NUMBER() OVER (
                ORDER BY rs.total_count DESC, rs.admitted_count DESC
            ) AS rnk
        FROM referral_stats rs
        INNER JOIN users u ON u.id = rs.referrer_id
        WHERE u.user_type_id = p_user_type_id
            AND u.is_active = TRUE
            AND rs.total_count > 0
    )
    SELECT 
        rr.rnk::INTEGER AS rank,
        rr.referrer_id,
        rr.referrer_name,
        rr.referrer_code,
        rr.total_referrals,
        rr.admitted_referrals,
        rr.conversion_rate,
        rr.referrer_email
    FROM ranked_referrers rr
    ORDER BY rr.rnk
    LIMIT p_limit;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_referrer_leaderboard TO referral;

-- Add comment
COMMENT ON FUNCTION get_referrer_leaderboard IS 
'Returns referrer leaderboard with rank, name, referral code, total referrals, admitted count, and conversion rate. Ranked by total referrals (highest = rank 1).';

