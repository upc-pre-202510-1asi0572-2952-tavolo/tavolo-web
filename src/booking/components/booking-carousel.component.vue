<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthenticationStore } from '@/iam/services/authentication.store';
import { BookingService } from '@/booking/services/booking.service';
import { Booking } from '@/booking/model/booking.entitie';

// Store y servicio
const authStore = useAuthenticationStore();
const bookingService = new BookingService();

// Estado
const bookings = ref([]);
const loading = ref(true);
const error = ref(null);
const responsiveOptions = ref([
    {
        breakpoint: '1024px',
        numVisible: 3,
        numScroll: 1
    },
    {
        breakpoint: '768px',
        numVisible: 2,
        numScroll: 1
    },
    {
        breakpoint: '560px',
        numVisible: 1,
        numScroll: 1
    }
]);

// Computa un mensaje amigable para mostrar
const noBookingsMessage = computed(() => {
    if (loading.value) return "Cargando tus reservas...";
    if (error.value) return "No pudimos cargar tus reservas. Intenta de nuevo más tarde.";
    if (bookings.value.length === 0) return "No tienes reservas activas. ¡Haz tu primera reserva ahora!";
    return "";
});

// Formato de fecha y hora más legible
const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
};

const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
};

// Cargar reservas del cliente autenticado
onMounted(async () => {
    try {
        loading.value = true;
        const clientId = authStore.currentUserId;
        const response = await bookingService.getBookingsByClientId(clientId);
        
        // Mapea la respuesta a objetos Booking
        bookings.value = response.data.map(item => new Booking({
            id: item.id,
            clientId: item.clientId,
            tableNumber: item.tableNumber,
            headquarterId: item.headquarterId,
            tableId: item.tableId,
            bookingDate: item.bookingDate,
            bookingSlots: item.bookingSlots || []
        }));
    } catch (err) {
        console.error('Error al cargar las reservas:', err);
        error.value = err.message || 'Error al cargar reservas';
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <div class="booking-carousel-container">
        <h2 class="carousel-title">Mis Reservas</h2>
        
        <!-- Muestra mensaje si no hay reservas -->
        <div v-if="bookings.length === 0" class="no-bookings-message">
            <i class="pi pi-calendar-times no-bookings-icon"></i>
            <p>{{ noBookingsMessage }}</p>
            <router-link to="/reservation" class="new-booking-link">
                <pv-button label="Hacer una reserva" icon="pi pi-calendar-plus" class="p-button-outlined" />
            </router-link>
        </div>
        
        <!-- Carrusel de reservas -->
        <pv-carousel 
            v-else 
            :value="bookings" 
            :numVisible="3" 
            :numScroll="1" 
            :responsiveOptions="responsiveOptions" 
            circular
            class="booking-carousel"
        >
            <template #item="slotProps">
                <div class="booking-card">
                    <div class="booking-header">
                        <i class="pi pi-calendar booking-icon"></i>
                        <span class="booking-date">{{ formatDate(slotProps.data.bookingDate) }}</span>
                    </div>
                    <div class="booking-content">
                        <div class="booking-detail">
                            <i class="pi pi-table"></i>
                            <span>Mesa {{ slotProps.data.tableNumber }}</span>
                        </div>
                        <!-- Nuevo elemento para mostrar el ID de la sede -->
                        <div class="booking-detail">
                            <i class="pi pi-building"></i>
                            <span>Sede ID: {{ slotProps.data.headquarterId }}</span>
                        </div>
                        <div class="booking-detail" v-if="slotProps.data.bookingSlots.length > 0">
                            <i class="pi pi-clock"></i>
                            <span>
                                {{ formatTime(slotProps.data.bookingSlots[0].startTime) }} - 
                                {{ formatTime(slotProps.data.bookingSlots[0].endTime) }}
                            </span>
                        </div>
                    </div>
                    <div class="booking-footer">
                        <pv-button icon="pi pi-eye" class="p-button-rounded p-button-text" 
                                tooltip="Ver detalles" :tooltipOptions="{ position: 'top' }" />
                        <pv-button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" 
                        tooltip="Cancelar reserva" :tooltipOptions="{ position: 'top' }" />
                    </div>
                </div>
            </template>
        </pv-carousel>
    </div>
</template>

<style scoped>
/* Contenedor principal del carrusel */
.booking-carousel-container {
    width: 100%;
    padding: 0;
    margin: 0;
    background-color: var(--surface-color);
    border-radius: 8px;
}

/* Estilos del título */
.carousel-title {
    font-size: 1.5rem;
    color: var(--text-primary);
    margin-bottom: 1.5rem;
    text-align: left;
    padding-left: 1rem;
    font-weight: 600;
}

/* Estilos para las tarjetas de reserva */
.booking-card {
    background-color: var(--primaryColor50);
    border-radius: 10px;
    border: 1px solid var(--primaryColor200);
    padding: 1.5rem;
    margin: 0.5rem;
    height: 250px;
    display: flex;
    flex-direction: column;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.booking-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(172, 131, 98, 0.15);
}

/* Cabecera de la tarjeta */
.booking-header {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--primaryColor200);
}

.booking-icon {
    font-size: 1.2rem;
    color: var(--primaryColor600);
    margin-right: 0.5rem;
}

.booking-date {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
}

/* Contenido de la tarjeta */
.booking-content {
    flex-grow: 1;
}

.booking-detail {
    display: flex;
    align-items: center;
    margin-bottom: 0.8rem;
}

.booking-detail i {
    font-size: 1rem;
    color: var(--primaryColor500);
    margin-right: 0.5rem;
}

/* Pie de la tarjeta */
.booking-footer {
    display: flex;
    justify-content: space-around;
    margin-top: auto;
}

/* Mensaje cuando no hay reservas */
.no-bookings-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    background-color: var(--primaryColor50);
    border-radius: 10px;
    border: 1px dashed var(--primaryColor300);
    padding: 2rem;
    text-align: center;
    margin: 1rem 0;
}

.no-bookings-icon {
    font-size: 3rem;
    color: var(--primaryColor400);
    margin-bottom: 1rem;
}

.no-bookings-message p {
    font-size: 1.1rem;
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
}

.new-booking-link {
    text-decoration: none;
}

/* Personalización del botón "Hacer una reserva" */
.new-booking-link :deep(.p-button.p-button-outlined) {
    border-color: var(--primaryColor500);
    color: var(--primaryColor700);
    background-color: transparent;
    transition: all 0.2s ease;
    border-radius: 30px;
    padding: 0.75rem 1.5rem;
}

.new-booking-link :deep(.p-button.p-button-outlined:hover) {
    background-color: var(--primaryColor50);
    border-color: var(--primaryColor600);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(172, 131, 98, 0.2);
}

.new-booking-link :deep(.p-button.p-button-outlined:active) {
    transform: translateY(0);
    background-color: var(--primaryColor100);
}

/* Personalización de los botones de acción en las tarjetas */
.booking-footer :deep(.p-button.p-button-rounded) {
    width: 2.5rem;
    height: 2.5rem;
    transition: all 0.2s ease;
}

/* Botón "Ver detalles" */
.booking-footer :deep(.p-button-text:not(.p-button-danger)) {
    color: var(--primaryColor600);
}

.booking-footer :deep(.p-button-text:not(.p-button-danger):hover) {
    background-color: var(--primaryColor100);
    color: var(--primaryColor800);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(172, 131, 98, 0.15);
}

.booking-footer :deep(.p-button-text:not(.p-button-danger):active) {
    transform: translateY(0);
    background-color: var(--primaryColor200);
}

/* Botón "Cancelar reserva" */
.booking-footer :deep(.p-button-danger.p-button-text) {
    background-color: transparent;
    color: #e57373;
}

.booking-footer :deep(.p-button-danger.p-button-text:hover) {
    background-color: rgba(244, 67, 54, 0.1);
    color: #f44336;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(244, 67, 54, 0.15);
}

.booking-footer :deep(.p-button-danger.p-button-text:active) {
    transform: translateY(0);
    background-color: rgba(244, 67, 54, 0.2);
}

/* Mejoras para los botones y navegación del carrusel */
:deep(.p-carousel-indicators .p-carousel-indicator.p-highlight button) {
    background-color: var(--primaryColor600);
}

:deep(.p-carousel-indicators .p-carousel-indicator button) {
    background-color: var(--primaryColor200);
}

:deep(.p-carousel-prev),
:deep(.p-carousel-next) {
    color: var(--primaryColor700) !important;
    background-color: var(--primaryColor50) !important;
    border-radius: 50%;
    margin: 0 0.5rem;
}

:deep(.p-carousel-prev:hover),
:deep(.p-carousel-next:hover) {
    background-color: var(--primaryColor100) !important;
    color: var(--primaryColor800) !important;
}

/* Media queries para responsividad */
@media (max-width: 768px) {
    .booking-card {
        padding: 1rem;
        margin: 0.3rem;
        height: 240px;
    }
    
    .carousel-title {
        font-size: 1.3rem;
        margin-bottom: 1rem;
    }
}

@media (max-width: 480px) {
    .booking-card {
        height: 220px;
    }
    
    .booking-detail {
        margin-bottom: 0.5rem;
    }
    
    .booking-date {
        font-size: 1rem;
    }
}
</style>