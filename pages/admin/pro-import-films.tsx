import dynamic from "next/dynamic";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

const ProImportFilms = dynamic(
  () => import("@/components/admin/ProImportFilms"),
  { ssr: false }
);

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#18181b",
      paper: "#23232a",
    },
    text: {
      primary: "#fff",
      secondary: "#bbb"
    }
  },
  // Correction : utilisez 'MuiDataGrid' dans 'components' uniquement si @mui/x-data-grid est installé et supporté.
  // Sinon, retirez ce bloc pour éviter l'erreur TS2353.
  // components: {
  //   MuiDataGrid: {
  //     styleOverrides: {
  //       root: {
  //         color: "#fff",
  //         backgroundColor: "#23232a"
  //       },
  //       cell: {
  //         color: "#fff",
  //       },
  //       columnHeaders: {
  //         color: "#fff",
  //         backgroundColor: "#23232a"
  //       }
  //     }
  //   }
  // }
});

export default function ProImportFilmsPage() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ProImportFilms />
    </ThemeProvider>
  );
}