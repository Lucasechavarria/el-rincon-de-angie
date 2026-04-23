"""
Test Supabase Storage Connection
Verifica que los buckets estén configurados correctamente.
"""
from storage import supabase, BUCKET_ORIGINALS, BUCKET_PREVIEWS, BUCKET_WATERMARK_MASTER, BUCKET_DELIVERIES

print("=" * 60)
print("TEST: Supabase Storage Connection")
print("=" * 60)

if not supabase:
    print("❌ Supabase not configured. Check your .env file.")
    print("   Make sure SUPABASE_URL and SUPABASE_SERVICE_KEY are set.")
    exit(1)

print("\n✅ Supabase client initialized")
print(f"   URL: {supabase.supabase_url}")

try:
    print("\n📦 Fetching buckets...")
    buckets = supabase.storage.list_buckets()
    
    print(f"\n✅ Storage connection OK!")
    print(f"   Found {len(buckets)} buckets:\n")
    
    expected_buckets = {
        BUCKET_ORIGINALS: "🔒 Private",
        BUCKET_PREVIEWS: "🌐 Public",
        BUCKET_WATERMARK_MASTER: "🔒 Private",
        BUCKET_DELIVERIES: "🔒 Private"
    }
    
    for bucket in buckets:
        # bucket is an object, access properties with dot notation
        name = bucket.name
        public = "🌐 Public" if bucket.public else "🔒 Private"
        
        if name in expected_buckets:
            status = "✅"
            expected = expected_buckets[name]
            if public != expected:
                status = "⚠️"
                print(f"   {status} {name} - {public} (Expected: {expected})")
            else:
                print(f"   {status} {name} - {public}")
        else:
            print(f"   ℹ️  {name} - {public} (Not used by app)")
    
    print("\n" + "=" * 60)
    print("Bucket Configuration:")
    print("=" * 60)
    print(f"Originals:        {BUCKET_ORIGINALS}")
    print(f"Previews:         {BUCKET_PREVIEWS}")
    print(f"Watermark Master: {BUCKET_WATERMARK_MASTER}")
    print(f"Deliveries:       {BUCKET_DELIVERIES}")
    print("=" * 60)
    
except Exception as e:
    print(f"\n❌ Storage connection failed: {e}")
    import traceback
    traceback.print_exc()
    exit(1)
