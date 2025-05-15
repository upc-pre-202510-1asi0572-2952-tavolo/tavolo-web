<script>
import {HeadquarterEntity} from "@/branching/model/headquarter.entity.js";
import {BranchingApiService} from "@/branching/services/branching-api.service.js";
import {useAuthenticationStore} from "@/iam/services/authentication.store.js";

export default {
  name: "AssignedHeadquarterCard",
  props: {},
  data() {
    return {
      apiService: new BranchingApiService(),
      headquarter: new HeadquarterEntity(
        '',
        '',
        '',
        '',
        0,
        0,
        '',
        '',
        '',
        0
      ),
      loading: true,
      error: null,
      currentSupervisorId: null,
      retryCount: 0,
      maxRetries: 3
    }
  },
  methods: {
    async fetchHeadquarterBySupervisor() {
      try {
        this.loading = true;
        this.error = null;

        // Import and use the authentication store
        const authStore = useAuthenticationStore();
        const supervisorId = authStore.currentUserId;

        if (!supervisorId) {
          this.error = 'User authentication required';
          return;
        }

        this.currentSupervisorId = supervisorId;

        // Get supervisor data with headquarterId
        const supervisorResponse = await this.apiService.getHeadquarterBySupervisorId(this.currentSupervisorId);

        if (!supervisorResponse || !supervisorResponse.data) {
          this.error = 'No supervisor data available';
          return;
        }

        const supervisorData = supervisorResponse.data;

        if (!supervisorData.headquarterId) {
          this.error = 'No headquarter assigned to this supervisor';
          return;
        }

        // Now fetch the correct headquarter using the headquarterId from the response
        await this.fetchHeadquarter(supervisorData.headquarterId);

      } catch (error) {
        console.error('Error fetching headquarter:', error);

        if (error.response) {
          if (error.response.status === 404) {
            this.error = 'Supervisor or headquarter not found';
          } else if (error.response.status === 500) {
            this.error = 'Server error. Please try again later.';
          } else {
            this.error = `Error: ${error.response.status}`;
          }
        } else if (error.request) {
          this.error = 'Network error. Please check your connection.';
        } else {
          this.error = error.message || 'Failed to load data';
        }
      } finally {
        this.loading = false;
      }
    },

    async fetchHeadquarter(id) {
      try {
        this.loading = true;
        this.error = null;

        if (!id) {
          this.error = 'Invalid headquarter ID';
          return;
        }

        const response = await this.apiService.getHeadquarterById(id);

        if (!response || !response.data) {
          this.error = 'No headquarter data available';
          return;
        }

        const data = response.data;

        this.headquarter = new HeadquarterEntity(
          data.id,
          data.name,
          data.landlinePhone,
          data.mobilePhone,
          data.latitude,
          data.longitude,
          data.streetAddress,
          data.openingTime,
          data.closingTime,
          data.intervalMinutes
        );
      } catch (error) {
        console.error('Error fetching headquarter:', error);

        if (error.response?.status === 404) {
          this.error = `Headquarter with ID ${id} not found`;
        } else {
          this.error = 'Failed to load headquarter data';
        }
      } finally {
        this.loading = false;
      }
    }
  },
  mounted() {
    this.fetchHeadquarterBySupervisor();
  }
}
</script>


<template>
  <div class="headquarter-card" v-if="!loading && !error">
    <div class="card-header">
      <h2>{{ headquarter.name }}</h2>
    </div>

    <div class="card-content">
      <div class="info-section">
        <div class="info-item">
          <i class="pi pi-map-marker"></i>
          <span>{{ headquarter.streetAddress }}</span>
        </div>
        <div class="info-item">
          <i class="pi pi-phone"></i>
          <span>{{ headquarter.landlinePhone }}</span>
        </div>
        <div class="info-item">
          <i class="pi pi-mobile"></i>
          <span>{{ headquarter.mobilePhone }}</span>
        </div>
        <div class="info-item">
          <i class="pi pi-clock"></i>
          <span>{{ headquarter.openingTime }} - {{ headquarter.closingTime }}</span>
        </div>
      </div>
    </div>
  </div>
  <div v-else-if="loading" class="loading">
    Loading headquarter information...
  </div>
  <div v-else-if="error" class="error">
    {{ error }}
  </div>
</template>

<style scoped>
.headquarter-card {
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(57, 43, 27, 0.15);
  overflow: hidden;
  background-color: rgba(186, 108, 45, 0.06);
  margin: 0 auto 20px;
  width: 100%;
}

.card-header {
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.card-header h2 {
  margin: 0;
  color: #392B1B;
  font-size: 1.5rem;
}

.card-content {
  padding: 20px;
  color: #392B1B;
  display: flex;
  justify-content: center;
}

.info-section {
  margin-bottom: 20px;
  max-width: 400px;
  width: 100%;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  justify-content: flex-start;
}

span {
  padding: 0.5rem;
}

.info-item i {
  width: 20px;
  margin-right: 12px;
  color: #59411A;
  font-size: 1rem;
}

.loading, .error {
  padding: 20px;
  text-align: center;
  background-color: #DCC8B9;
  border-radius: 8px;
  color: #392B1B;
  max-width: 500px;
  margin: 0 auto;
}

.error {
  color: #721c24;
  background-color: #f8d7da;
}
</style>