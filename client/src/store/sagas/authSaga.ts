import { takeLatest, put, call } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { loginUser, loginUserSuccess, loginUserFailure } from '../slices/authSlice';
import { authenticateUserApi } from '../../apis/auth';
import { LoginPayload } from '@/types/LoginTypes';

// Saga to handle user login
function* handleLogin(action: PayloadAction<LoginPayload>) {
    try {
        // Call the authenticateUser API function with the email
        const user: LoginPayload = yield call(authenticateUserApi, action.payload);
        // Dispatch the loginUserSuccess action with the user data
        yield put(loginUserSuccess(user));
    } catch (error: any) {
        // If there is an error, dispatch the loginUserFailure action with the error message
        yield put(loginUserFailure(error.message || 'An error occurred'));
    }
}

function* authSaga() {
    // Listen for the loginUser action and call the handleLogin saga when dispatched
    yield takeLatest(loginUser.type, handleLogin);
}

export default authSaga;
