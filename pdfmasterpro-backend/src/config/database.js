const { getSupabase } = require('./supabase');
const logger = require('../utils/logger');

const connectDB = async () => {
    try {
        const supabase = getSupabase();

        // Test connection by making a simple query
        const { data, error } = await supabase.from('users').select('count').limit(1);

        if (error && error.code !== 'PGRST116') {
            // PGRST116 = table not found, which is OK on first run
            throw error;
        }

        logger.info('Supabase Connected Successfully');
        return true;
    } catch (error) {
        logger.error(`Supabase Connection Error: ${error.message}`);
        // Don't exit process, just log the error - table might not exist yet
        logger.warn('Note: If users table does not exist, please create it in Supabase Dashboard');
        return false;
    }
};

module.exports = connectDB;
