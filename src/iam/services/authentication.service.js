import http from "../../shared/services/http-common.js";

/**
 * Service class for authentication.
 */
export class AuthenticationService {
    /**
     * Sign in method.
     * @param signInRequest
     * @returns {Promise}
     */
    signIn(signInRequest) {
        return http.post("/auth/sign-in", signInRequest);
    }

    /**
     * Sign up method.
     * @param signUpRequest
     * @returns {Promise}
     */
    signUp(signUpRequest) {
        return http.post("/auth/sign-up", signUpRequest);
    }
}