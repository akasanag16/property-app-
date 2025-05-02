
export async function checkEmailColumnExists(supabase: any) {
  try {
    const { data, error } = await supabase.rpc('list_public_tables');
    
    if (error) {
      console.error('Error checking tables:', error);
      return false;
    }
    
    // Get table structure
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'profiles');
      
    if (columnsError) {
      console.error('Error checking columns:', columnsError);
      return false;
    }
    
    if (columns) {
      const hasEmailColumn = columns.some(col => col.column_name === 'email');
      return hasEmailColumn;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking email column:', error);
    return false;
  }
}
