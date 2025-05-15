import http from "@/shared/services/http-common.js";

export class BranchingApiService {
    //Headquarter endpoints
    async getHeadquarterBySupervisorId(supervisorId) {
        return http.get(`/headquarters/${supervisorId}`);
    }
    async getHeadquarterById(headquarterId) {
        return http.get(`/headquarters/${headquarterId}`);
    }
}