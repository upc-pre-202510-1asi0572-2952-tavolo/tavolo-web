<script>
import { ref, reactive } from 'vue';
import { BranchingApiService } from "@/branching/services/branching-api.service.js";

export default {
  name: "headquarter-form",
  emits: ['headquarter-created', 'cancel'],
  setup(props, { emit }) {
    const apiService = new BranchingApiService();
    const loading = ref(false);
    const success = ref(false);
    const error = ref('');

    // Initialize the headquarter object with the correct field names
    const headquarter = reactive({
      name: '',
      landlinePhone: '',
      mobilePhone: '',
      latitude: null,
      longitude: null,
      street: '', // Changed from streetAddress to street
      number: '',
      city: '',
      postalCode: '',
      country: '',
      openingTime: '',
      closingTime: '',
      intervalMinutes: null
    });

    // Validation state
    const validation = reactive({
      name: { valid: true, message: '' },
      landlinePhone: { valid: true, message: '' },
      mobilePhone: { valid: true, message: '' },
      latitude: { valid: true, message: '' },
      longitude: { valid: true, message: '' },
      street: { valid: true, message: '' }, // Changed from streetAddress to street
      number: { valid: true, message: '' },
      city: { valid: true, message: '' },
      postalCode: { valid: true, message: '' },
      country: { valid: true, message: '' },
      openingTime: { valid: true, message: '' },
      closingTime: { valid: true, message: '' },
      intervalMinutes: { valid: true, message: '' }
    });

    // Validate form
    const validateForm = () => {
      let isValid = true;

      // Required fields
      if (!headquarter.name.trim()) {
        validation.name.valid = false;
        validation.name.message = 'El nombre es requerido';
        isValid = false;
      } else {
        validation.name.valid = true;
        validation.name.message = '';
      }

      if (!headquarter.street.trim()) {
        validation.street.valid = false;
        validation.street.message = 'La dirección es requerida';
        isValid = false;
      } else {
        validation.street.valid = true;
        validation.street.message = '';
      }

      if (!headquarter.city.trim()) {
        validation.city.valid = false;
        validation.city.message = 'La ciudad es requerida';
        isValid = false;
      } else {
        validation.city.valid = true;
        validation.city.message = '';
      }

      if (!headquarter.country.trim()) {
        validation.country.valid = false;
        validation.country.message = 'El país es requerido';
        isValid = false;
      } else {
        validation.country.valid = true;
        validation.message = '';
      }

      // Validate phone numbers (optional but must be valid if provided)
      if (headquarter.landlinePhone && !/^[+]?[\d\s-]+$/.test(headquarter.landlinePhone)) {
        validation.landlinePhone.valid = false;
        validation.landlinePhone.message = 'Número de teléfono inválido';
        isValid = false;
      } else {
        validation.landlinePhone.valid = true;
        validation.landlinePhone.message = '';
      }

      if (headquarter.mobilePhone && !/^[+]?[\d\s-]+$/.test(headquarter.mobilePhone)) {
        validation.mobilePhone.valid = false;
        validation.mobilePhone.message = 'Número de móvil inválido';
        isValid = false;
      } else {
        validation.mobilePhone.valid = true;
        validation.mobilePhone.message = '';
      }

      // Validate coordinates
      if (headquarter.latitude !== null && (isNaN(headquarter.latitude) || headquarter.latitude < -90 || headquarter.latitude > 90)) {
        validation.latitude.valid = false;
        validation.latitude.message = 'Latitud inválida (debe estar entre -90 y 90)';
        isValid = false;
      } else {
        validation.latitude.valid = true;
        validation.latitude.message = '';
      }

      if (headquarter.longitude !== null && (isNaN(headquarter.longitude) || headquarter.longitude < -180 || headquarter.longitude > 180)) {
        validation.longitude.valid = false;
        validation.longitude.message = 'Longitud inválida (debe estar entre -180 y 180)';
        isValid = false;
      } else {
        validation.longitude.valid = true;
        validation.longitude.message = '';
      }

      // Validate time format
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!timeRegex.test(headquarter.openingTime)) {
        validation.openingTime.valid = false;
        validation.openingTime.message = 'Formato de hora inválido (HH:MM)';
        isValid = false;
      } else {
        validation.openingTime.valid = true;
        validation.openingTime.message = '';
      }

      if (!timeRegex.test(headquarter.closingTime)) {
        validation.closingTime.valid = false;
        validation.closingTime.message = 'Formato de hora inválido (HH:MM)';
        isValid = false;
      } else {
        validation.closingTime.valid = true;
        validation.closingTime.message = '';
      }

      // Validate interval minutes
      if (headquarter.intervalMinutes === null || headquarter.intervalMinutes <= 0) {
        validation.intervalMinutes.valid = false;
        validation.intervalMinutes.message = 'El intervalo debe ser mayor a 0';
        isValid = false;
      } else {
        validation.intervalMinutes.valid = true;
        validation.intervalMinutes.message = '';
      }

      return isValid;
    };

    // Submit form
    const submitForm = async () => {
      if (!validateForm()) return;

      loading.value = true;
      error.value = '';

      try {
        const response = await apiService.createHeadquarter(headquarter);

        if (response && response.data) {
          success.value = true;
          emit('headquarter-created', response.data);
          resetForm();
        }
      } catch (err) {
        console.error('Error creating headquarter:', err);
        error.value = err.response?.data?.message || 'Error al crear la sede';
      } finally {
        loading.value = false;
      }
    };

    const resetForm = () => {
      Object.assign(headquarter, {
        name: '',
        landlinePhone: '',
        mobilePhone: '',
        latitude: null,
        longitude: null,
        street: '',
        number: '',
        city: '',
        postalCode: '',
        country: '',
        openingTime: '',
        closingTime: '',
        intervalMinutes: null
      });

      // Reset validation
      Object.keys(validation).forEach(key => {
        validation[key].valid = true;
        validation[key].message = '';
      });

      success.value = false;
      error.value = '';
    };

    const cancel = () => {
      emit('cancel');
    };

    return {
      headquarter,
      validation,
      loading,
      success,
      error,
      submitForm,
      cancel
    };
  }
}
</script>

<template>
  <div class="headquarter-form-container">
    <div v-if="success" class="success-message">
      <i class="pi pi-check-circle"></i>
      <span>Sede creada exitosamente</span>
    </div>

    <div v-if="error" class="error-message form-error">
      <i class="pi pi-times-circle"></i>
      <span>{{ error }}</span>
    </div>

    <form @submit.prevent="submitForm" class="headquarter-form">
      <!-- Basic Information -->
      <div class="form-section">
        <h3 class="section-title">Información Básica</h3>

        <div class="form-row">
          <div class="form-group">
            <label for="name">Nombre de Sede*</label>
            <input
              id="name"
              v-model="headquarter.name"
              type="text"
              class="form-control"
              :class="{'error': !validation.name.valid}"
              placeholder="Nombre de la sede"
            />
            <small v-if="!validation.name.valid" class="error-text">
              {{ validation.name.message }}
            </small>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="landlinePhone">Teléfono Fijo</label>
            <input
              id="landlinePhone"
              v-model="headquarter.landlinePhone"
              type="text"
              class="form-control"
              :class="{'error': !validation.landlinePhone.valid}"
              placeholder="+511234567"
            />
            <small v-if="!validation.landlinePhone.valid" class="error-text">
              {{ validation.landlinePhone.message }}
            </small>
          </div>

          <div class="form-group">
            <label for="mobilePhone">Teléfono Móvil</label>
            <input
              id="mobilePhone"
              v-model="headquarter.mobilePhone"
              type="text"
              class="form-control"
              :class="{'error': !validation.mobilePhone.valid}"
              placeholder="987654321"
            />
            <small v-if="!validation.mobilePhone.valid" class="error-text">
              {{ validation.mobilePhone.message }}
            </small>
          </div>
        </div>
      </div>

      <!-- Location Information -->
      <div class="form-section">
        <h3 class="section-title">Ubicación</h3>

        <div class="form-row">
          <div class="form-group">
            <label for="street">Dirección*</label>
            <input
              id="street"
              v-model="headquarter.street"
              type="text"
              class="form-control"
              :class="{'error': !validation.street.valid}"
              placeholder="Av. Principal"
            />
            <small v-if="!validation.street.valid" class="error-text">
              {{ validation.street.message }}
            </small>
          </div>

          <div class="form-group small-input">
            <label for="number">Número</label>
            <input
              id="number"
              v-model="headquarter.number"
              type="text"
              class="form-control"
              :class="{'error': !validation.number.valid}"
              placeholder="123"
            />
            <small v-if="!validation.number.valid" class="error-text">
              {{ validation.number.message }}
            </small>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="city">Ciudad*</label>
            <input
              id="city"
              v-model="headquarter.city"
              type="text"
              class="form-control"
              :class="{'error': !validation.city.valid}"
              placeholder="Lima"
            />
            <small v-if="!validation.city.valid" class="error-text">
              {{ validation.city.message }}
            </small>
          </div>

          <div class="form-group">
            <label for="postalCode">Código Postal</label>
            <input
              id="postalCode"
              v-model="headquarter.postalCode"
              type="text"
              class="form-control"
              :class="{'error': !validation.postalCode.valid}"
              placeholder="15023"
            />
            <small v-if="!validation.postalCode.valid" class="error-text">
              {{ validation.postalCode.message }}
            </small>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="country">País*</label>
            <input
              id="country"
              v-model="headquarter.country"
              type="text"
              class="form-control"
              :class="{'error': !validation.country.valid}"
              placeholder="Perú"
            />
            <small v-if="!validation.country.valid" class="error-text">
              {{ validation.country.message }}
            </small>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="latitude">Latitud</label>
            <input
              id="latitude"
              v-model.number="headquarter.latitude"
              type="number"
              step="0.000001"
              class="form-control"
              :class="{'error': !validation.latitude.valid}"
              placeholder="-12.046373"
            />
            <small v-if="!validation.latitude.valid" class="error-text">
              {{ validation.latitude.message }}
            </small>
          </div>

          <div class="form-group">
            <label for="longitude">Longitud</label>
            <input
              id="longitude"
              v-model.number="headquarter.longitude"
              type="number"
              step="0.000001"
              class="form-control"
              :class="{'error': !validation.longitude.valid}"
              placeholder="-77.042754"
            />
            <small v-if="!validation.longitude.valid" class="error-text">
              {{ validation.longitude.message }}
            </small>
          </div>
        </div>
      </div>

      <!-- Schedule Information -->
      <div class="form-section">
        <h3 class="section-title">Horario de Atención</h3>

        <div class="form-row">
          <div class="form-group">
            <label for="openingTime">Hora de Apertura*</label>
            <input
              id="openingTime"
              v-model="headquarter.openingTime"
              type="time"
              class="form-control"
              :class="{'error': !validation.openingTime.valid}"
            />
            <small v-if="!validation.openingTime.valid" class="error-text">
              {{ validation.openingTime.message }}
            </small>
          </div>

          <div class="form-group">
            <label for="closingTime">Hora de Cierre*</label>
            <input
              id="closingTime"
              v-model="headquarter.closingTime"
              type="time"
              class="form-control"
              :class="{'error': !validation.closingTime.valid}"
            />
            <small v-if="!validation.closingTime.valid" class="error-text">
              {{ validation.closingTime.message }}
            </small>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="intervalMinutes">Intervalo de Reservas (minutos)*</label>
            <input
              id="intervalMinutes"
              v-model.number="headquarter.intervalMinutes"
              type="number"
              min="1"
              class="form-control"
              :class="{'error': !validation.intervalMinutes.valid}"
              placeholder="30"
            />
            <small v-if="!validation.intervalMinutes.valid" class="error-text">
              {{ validation.intervalMinutes.message }}
            </small>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button
          type="button"
          class="cancel-button"
          @click="cancel"
          :disabled="loading"
        >
          Cancelar
        </button>
        <button
          type="submit"
          class="submit-button"
          :disabled="loading"
        >
          <i class="pi pi-spin pi-spinner" v-if="loading"></i>
          <span>{{ loading ? 'Creando sede...' : 'Crear Sede' }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.headquarter-form-container {
  width: 100%;
}

.headquarter-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-section {
  background: linear-gradient(135deg, var(--primaryColor50) 0%, var(--background-color) 100%);
  border: 1px solid var(--primaryColor200);
  border-radius: 12px;
  padding: 1.5rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1.25rem 0;
  border-bottom: 1px solid var(--primaryColor200);
  padding-bottom: 0.75rem;
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-group.small-input {
  flex: 0.3;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.form-control {
  padding: 0.75rem 1rem;
  border: 1px solid var(--primaryColor200);
  border-radius: 8px;
  background: var(--surface-color);
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: var(--primaryColor500);
  box-shadow: 0 0 0 3px rgba(172, 131, 98, 0.1);
}

.form-control.error {
  border-color: #f44336;
  background-color: rgba(244, 67, 54, 0.05);
}

.error-text {
  font-size: 0.75rem;
  color: #f44336;
  margin-top: 0.375rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.cancel-button {
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: 1px solid var(--primaryColor300);
  border-radius: 8px;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-button:hover:not(:disabled) {
  background: rgba(172, 131, 98, 0.1);
}

.submit-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, var(--primaryColor500) 0%, var(--primaryColor400) 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(172, 131, 98, 0.3);
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(172, 131, 98, 0.4);
}

.submit-button:disabled, .cancel-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.success-message, .form-error {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
  border-radius: 8px;
  font-weight: 600;
}

.success-message {
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
  color: #4CAF50;
}

.form-error {
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  color: #f44336;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 1rem;
  }

  .form-group.small-input {
    flex: 1;
  }
}
</style>