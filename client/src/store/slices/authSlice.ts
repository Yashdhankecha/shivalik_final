import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    // Login User Data
    user: null,
    error: null,
    status: 'idle',
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Login User Actions
        loginUser(state, action) {
            state.status = 'pending';
        },
        loginUserSuccess(state, action) {
            state.user = action.payload;
            state.error = null;
            state.status = 'complete';
        },
        loginUserFailure(state, action) {
            state.user = null;
            state.error = action.payload;
            state.status = 'failed';
        },
        resetLoginUser(state) {
            state.status = 'idle';
        },
    },
});

export const {
    loginUser, loginUserSuccess, loginUserFailure, resetLoginUser
} = authSlice.actions;

export default authSlice.reducer;
