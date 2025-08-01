import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    currentStep: 0,
    formData: {
        category: '',
        subcategory: '',
        details: {},
        images: [],
        location: {},
        audience: 'PUBLIC', // 'PUBLIC' | 'FOLLOWERS' | 'ONLY_ME'
    },

    steps: [
        { id: 1, title: "Catégorisation", progress: 15 },
        { id: 2, title: "Détails", progress: 30 },
        { id: 3, title: "Images", progress: 50 },
        { id: 4, title: "Emplacement", progress: 65 },
        { id: 5, title: "Audience", progress: 80 },
        { id: 6, title: "Vérification", progress: 100 },
    ]
};

const formSlice = createSlice({
    name: 'form',
    initialState,
    reducers: {
        nextStep: (state) => {
            state.currentStep = Math.min(state.currentStep + 1, state.steps.length - 1);
        },
        prevStep: (state) => {
            state.currentStep = Math.max(state.currentStep - 1, 0);
        },
        updateFormData: (state, action) => {
            state.formData = { ...state.formData, ...action.payload };
        },
        resetForm: () => initialState
    }
});

export const { nextStep, prevStep, updateFormData, resetForm } = formSlice.actions;
export default formSlice.reducer;