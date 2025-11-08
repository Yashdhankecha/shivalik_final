import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    // Verify OTP Data
    user: null,
    error: null,
    status: 'idle',
};

const otpSlice = createSlice({
    name: 'otp',
    initialState,
    reducers: {
        // Verify OTP Actions
        verifyOTP(state, action) {
            state.status = 'pending';
        },
        verifyOTPSuccess(state, action) {
            state.user = action.payload;
            state.error = null;
            state.status = 'complete';
        },
        verifyOTPFailure(state, action) {
            state.user = null;
            state.error = action.payload;
            state.status = 'failed';
        },
        resetVerifyOTP(state) {
            state.status = 'idle';
        },
    },
});

export const {
    verifyOTP, verifyOTPSuccess, verifyOTPFailure, resetVerifyOTP
} = otpSlice.actions;

export default otpSlice.reducer;
