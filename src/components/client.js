import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://doeablqowbonyptmetza.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvZWFibHFvd2JvbnlwdG1ldHphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgyMTkyODUsImV4cCI6MjA0Mzc5NTI4NX0.hZVocbsIsy-7eWMNsE4q_h0g7_UcdYnV-8QmyWQZpzM";
export const supabase = createClient(supabaseUrl, supabaseKey);
