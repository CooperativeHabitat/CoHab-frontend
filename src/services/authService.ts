import { ProblemDetail } from "@/error/types/serverErrorResponses";
import {apiRequest} from "@/services/api.ts";


export const authService = {
    async isAuthenticated(): Promise<Boolean> {
        try{
            await apiRequest("auth/isAuthenticated", {method: 'POST'});
            return true
        } catch(err){

        }
        return false
    },

    async checkUser(): Promise<Boolean> {
        try{
            await apiRequest("auth/isUser", {method: 'POST'});
            return true
        } catch(err) {
        }
        return false
    },

    logout()  {
        localStorage.removeItem('token');
        localStorage.removeItem('expiresAt');
    }
}