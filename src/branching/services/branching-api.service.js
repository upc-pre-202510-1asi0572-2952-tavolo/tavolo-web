import http from "@/shared/services/http-common.js";

export class BranchingApiService {
    //Headquarter endpoints
    async getHeadquarterById(headquarterId) {
        return http.get(`/headquarters/${headquarterId}`);
    }
}