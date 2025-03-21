import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import { createVuetify } from 'vuetify';
import colors from 'vuetify/lib/util/colors';

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    ssr: true,
    theme: {
      themes: {
        light: {
          dark: false,
          colors: {
            primary: colors.blue.darken1,
            secondary: colors.teal.darken1,
            accent: colors.orange.darken1,
            error: colors.red.darken1,
            success: colors.green.darken1,
            warning: colors.amber.darken1,
            info: colors.cyan.darken1,
          },
          variables: {
            'border-radius': '8px',
            'button-height': '40px',
            'card-border-radius': '12px',
            'card-padding': '16px',
          },
        },
      },
    },
    defaults: {
      VBtn: {
        elevation: 0,
        rounded: 'lg',
        class: 'text-none',
      },
      VCard: {
        elevation: 2,
        rounded: 'lg',
      },
      VTextField: {
        variant: 'outlined',
        density: 'comfortable',
      },
      VSelect: {
        variant: 'outlined',
        density: 'comfortable',
      },
      VProgressLinear: {
        rounded: 'lg',
        height: 8,
      },
    },
    icons: {
      defaultSet: 'mdi',
    },
  });
  nuxtApp.vueApp.use(vuetify);
});
