import { defineStore } from "pinia";
import { ref } from "vue";
import type { ContactStats } from "@/types";
import { contactApi, extractError } from "@/api";

export const useContactStore = defineStore("contactData", () => {
    const contact_length = ref<ContactStats | null>(null);
    const loading_contacts_length = ref(false);
    const error = ref<string | null>(null);

    async function contactsLength():Promise<void> {
        loading_contacts_length.value = true;
        error.value = null;
        try {
            const res = await contactApi.contactCount();
            if (res.success && res.data) {
                contact_length.value = res.data;
            };
        } catch (err) {
            error.value = extractError(err);
        } finally {
            loading_contacts_length.value = false;
        }
    }
    return { contact_length, contactsLength };
}); 