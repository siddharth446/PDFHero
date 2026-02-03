const { getSupabase } = require('../config/supabase');
const bcrypt = require('bcryptjs');

/**
 * User model using Supabase instead of MongoDB/Mongoose
 * Maintains similar API for compatibility with existing controllers
 */
const User = {
    /**
     * Find a user by query (supports email lookup)
     * @param {Object} query - Query object with email field
     * @returns {Object|null} User object or null
     */
    async findOne(query) {
        try {
            const supabase = getSupabase();
            const { email } = query;
            let queryBuilder = supabase.from('users').select('*');

            if (email) {
                queryBuilder = queryBuilder.eq('email', email);
            }

            const { data, error } = await queryBuilder.single();

            if (error && error.code === 'PGRST116') {
                // No rows found
                return null;
            }
            if (error) throw error;

            if (data) {
                // Add matchPassword method for compatibility
                data.matchPassword = async function (enteredPassword) {
                    return await bcrypt.compare(enteredPassword, this.password);
                };
                // Add _id alias for compatibility
                data._id = data.id;
            }

            return data;
        } catch (error) {
            console.error('User.findOne error:', error);
            throw error;
        }
    },

    /**
     * Create a new user
     * @param {Object} userData - User data with name, email, password
     * @returns {Object} Created user object
     */
    async create(userData) {
        try {
            const supabase = getSupabase();

            // Hash password before storing
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(userData.password, salt);

            const { data, error } = await supabase
                .from('users')
                .insert([{
                    name: userData.name,
                    email: userData.email,
                    password: hashedPassword,
                    is_premium: userData.isPremium || false
                }])
                .select()
                .single();

            if (error) throw error;

            // Return with _id alias for compatibility
            return {
                ...data,
                _id: data.id,
                id: data.id,
                isPremium: data.is_premium
            };
        } catch (error) {
            console.error('User.create error:', error);
            throw error;
        }
    },

    /**
     * Find user by ID
     * @param {string} id - User UUID
     * @returns {Object|null} User object or null
     */
    async findById(id) {
        try {
            const supabase = getSupabase();

            const { data, error } = await supabase
                .from('users')
                .select('id, name, email, is_premium, created_at')
                .eq('id', id)
                .single();

            if (error && error.code === 'PGRST116') {
                return null;
            }
            if (error) throw error;

            if (data) {
                data._id = data.id;
                data.isPremium = data.is_premium;
            }

            return data;
        } catch (error) {
            console.error('User.findById error:', error);
            throw error;
        }
    },

    /**
     * Update user by ID
     * @param {string} id - User UUID
     * @param {Object} updateData - Data to update
     * @returns {Object} Updated user object
     */
    async findByIdAndUpdate(id, updateData) {
        try {
            const supabase = getSupabase();

            const { data, error } = await supabase
                .from('users')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            return { ...data, _id: data.id };
        } catch (error) {
            console.error('User.findByIdAndUpdate error:', error);
            throw error;
        }
    }
};

module.exports = User;
