<script setup>
import { ref, reactive, onMounted } from 'vue';
import { MenuService } from '../service/menu.service';
import { useToast } from 'primevue/usetoast';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import InputNumber from 'primevue/inputnumber';
import Dialog from 'primevue/dialog';
const props = defineProps({
  category: {
    type: String,
    required: true
  },
  onItemCreated: {
    type: Function,
    default: () => {}
  }
});

const menuService = new MenuService();
const toast = useToast();
const showDialog = ref(false);
const isSubmitting = ref(false);
const fileReader = new FileReader();
const imagePreview = ref('');
const categories = ref([]);

const newItem = reactive({
  name: '',
  description: '',
  price: null,
  category: props.category,
  imageBase64: ''
});

onMounted(async () => {
  try {
    // Fetch available categories
    const response = await menuService.getAllCategories();
    // Transform array of strings into array of objects for PrimeVue dropdown
    categories.value = (response.data)
        .map(category => ({
          label: formatCategoryName(category),
          value: category
        }));

    console.log('Categories loaded:', categories.value);
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Fallback categories if API fails
    categories.value = [
      { label: 'Entradas', value: 'ENTRADAS' },
      { label: 'Platos Principales', value: 'PLATOS_PRINCIPALES' },
      { label: 'Postres', value: 'POSTRES' },
      { label: 'Bebidas', value: 'BEBIDAS' }
    ];
  }

  // Set initial category from props
  newItem.category = props.category;
});

// Format category name for display
const formatCategoryName = (category) => {
  if (!category) return '';
  return category
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    fileReader.readAsDataURL(file);
    fileReader.onload = () => {
      newItem.imageBase64 = fileReader.result;
      imagePreview.value = fileReader.result;
    };
  }
};

const resetForm = () => {
  newItem.name = '';
  newItem.description = '';
  newItem.price = null;
  newItem.category = props.category; // Reset to initial category
  newItem.imageBase64 = '';
  imagePreview.value = '';
};

const createItem = async () => {
  if (!newItem.name || !newItem.description || !newItem.price || !newItem.imageBase64) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Todos los campos son obligatorios', life: 3000 });
    return;
  }

  try {
    isSubmitting.value = true;
    await menuService.createMenuItem(newItem);
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Plato agregado correctamente', life: 3000 });
    props.onItemCreated(newItem.category);
    resetForm();
    showDialog.value = false;
  } catch (error) {
    console.error('Error creating menu item:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el plato', life: 3000 });
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="admin-menu-actions">
    <Button
      icon="pi pi-plus"
      label="Agregar plato"
      class="add-item-btn"
      @click="showDialog = true"
    />

    <Dialog
      v-model:visible="showDialog"
      header="Agregar nuevo plato"
      :style="{width: '450px'}"
      :modal="true"
      class="menu-item-dialog"
    >
      <div class="form-container">
        <div class="form-field">
          <label for="name">Nombre</label>
          <InputText id="name" v-model="newItem.name" class="w-full" />
        </div>

        <div class="form-field">
          <label for="description">Descripción</label>
          <Textarea id="description" v-model="newItem.description" rows="3" class="w-full" />
        </div>

        <div class="form-field">
          <label for="price">Precio</label>
          <InputNumber id="price" v-model="newItem.price" mode="currency" currency="PEN" locale="es-PE" class="w-full" />
        </div>

        <div class="form-field">
          <label for="category">Categoría</label>
          <Dropdown
            id="category"
            v-model="newItem.category"
            :options="categories"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccionar categoría"
            class="w-full"
          />
        </div>

        <div class="form-field">
          <label for="image">Imagen</label>
          <div class="image-upload-container">
            <Button
              type="button"
              icon="pi pi-image"
              label="Seleccionar imagen"
              class="p-button-outlined"
              @click="$refs.fileInput.click()"
            />
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              @change="handleImageUpload"
              style="display: none"
            />
          </div>
          <div v-if="imagePreview" class="image-preview">
            <img :src="imagePreview" alt="Vista previa" />
          </div>
        </div>
      </div>

      <template #footer>
        <Button
          label="Cancelar"
          icon="pi pi-times"
          @click="showDialog = false"
          class="p-button-text"
        />
        <Button
          label="Guardar"
          icon="pi pi-check"
          @click="createItem"
          :loading="isSubmitting"
        />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.admin-menu-actions {
  margin-bottom: 20px;
}

.add-item-btn {
  background-color: var(--primaryColor500);
  border-color: var(--primaryColor600);
}

.add-item-btn:hover {
  background-color: var(--primaryColor600);
  border-color: var(--primaryColor700);
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field label {
  font-weight: 600;
  color: var(--text-primary);
}

.image-upload-container {
  margin-top: 6px;
}

.image-preview {
  margin-top: 12px;
  padding: 10px;
  border: 1px dashed var(--primaryColor300);
  border-radius: 8px;
  text-align: center;
}

.image-preview img {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
}

:deep(.menu-item-dialog .p-dialog-header) {
  background-color: var(--primaryColor50);
  border-bottom: 1px solid var(--primaryColor100);
}

:deep(.menu-item-dialog .p-dialog-content) {
  padding: 20px;
  background-color: white;
}

:deep(.menu-item-dialog .p-dialog-footer) {
  background-color: var(--primaryColor50);
  border-top: 1px solid var(--primaryColor100);
  padding: 12px 20px;
}
.admin-item-creator {
  margin-bottom: 25px;
  background-color: var(--primaryColor50);
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(172, 131, 98, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.admin-item-creator:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(172, 131, 98, 0.15);
}

@media (max-width: 768px) {
  .admin-item-creator {
    padding: 12px;
    margin-bottom: 20px;
  }
}
</style>