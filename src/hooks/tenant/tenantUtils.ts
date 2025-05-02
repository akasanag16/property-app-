
export async function checkEmailColumnExists(supabase: any) {
  try {
    // A more direct way to check for column existence in Postgres
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'profiles')
      .eq('column_name', 'email');
      
    if (error) {
      console.error('Error checking columns:', error);
      return false;
    }
    
    // If data is an array with at least one item, the email column exists
    return data && data.length > 0;
    
  } catch (error) {
    console.error('Error checking email column:', error);
    return false;
  }
}
