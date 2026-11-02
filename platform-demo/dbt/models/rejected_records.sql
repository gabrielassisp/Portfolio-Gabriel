select source,record_id,payload,run_id,'invalid_id_or_domain' as rejection_reason
from {{ ref('stg_records') }} where is_valid is not true
