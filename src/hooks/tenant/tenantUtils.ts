
export async function checkEmailColumnExists(supabase: any) {
  try {
    // A simple approach: Try to select the email column from any profile
    // If the column doesn't exist, this will fail with a specific error message
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email')
      .limit(1);
      
    if (error) {
      // Check if the error message indicates the column doesn't exist
      if (error.message && 
          (error.message.includes("column \"email\" does not exist") ||
           error.message.includes("does not exist in the current schema"))) {
        console.log('Email column does not exist in profiles table');
        return false;
      }
      
      console.error('Error checking for email column:', error);
      // If we got a different error, we can't be sure about the column
      return false;
    }
    
    // If we got here without errors, the column exists
    console.log('Email column exists in profiles table');
    return true;
    
  } catch (error) {
    console.error('Error checking email column:', error);
    return false;
  }
}
