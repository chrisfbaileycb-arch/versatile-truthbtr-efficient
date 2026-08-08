import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://cdnphrwlgmuikdklevix.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjNlNTc5NTg5LWNhZTItNGIyZS1hZjI5LTllYzdhOGNlNzZjNCJ9.eyJwcm9qZWN0SWQiOiJjZG5waHJ3bGdtdWlrZGtsZXZpeCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzg2MjA5MTgzLCJleHAiOjIxMDE1NjkxODMsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.__A1ez8jreBJ6yOLybASODBjNbMmsLAN13Z8IDj3S18';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };