import { useState, useRef } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Snackbar, Button, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, Alert
} from "@mui/material";

export default function ProImportFilms() {
  const [films, setFilms] = useState([]);
  const [selected, setSelected] = useState([]);
  const [feedback, setFeedback] = useState({ open: false, msg: "", sev: "success" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const fileInput = useRef();

  // Import fichier
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      setFilms(parsed.map((f, i) => ({ ...f, id: i })));
      setFeedback({ open: true, msg: "Fichier chargé !", sev: "success" });
    } catch {
      setFeedback({ open: true, msg: "Fichier JSON invalide.", sev: "error" });
    }
  };

  // Edition inline
  const processRowUpdate = (newRow) => {
    setFilms((prev) =>
      prev.map((row) => (row.id === newRow.id ? newRow : row))
    );
    return newRow;
  };

  // Suppression ligne
  const handleDelete = (ids) => {
    setFilms((prev) => prev.filter((f) => !ids.includes(f.id)));
    setSelected([]);
  };

  // Confirmation d’import
  const handleImport = () => setConfirmOpen(true);

  // Import effectif
  const doImport = async () => {
    setConfirmOpen(false);
    const toImport = films.filter((f) => selected.includes(f.id));
    try {
      const res = await fetch("/api/admin/import-movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toImport),
      });
      const result = await res.json();
      setFeedback({
        open: true,
        msg: `Ajoutés: ${result.added}, Ignorés (doublons): ${result.skipped}`,
        sev: "success",
      });
    } catch {
      setFeedback({
        open: true,
        msg: "Erreur lors de l'import",
        sev: "error",
      });
    }
  };

  const columns = [
    {
      field: "image",
      headerName: "Affiche",
      width: 90,
      renderCell: (params) =>
        params.value ? (
          <img src={params.value} alt="img" style={{ width: 40, height: 60, objectFit: "cover" }} />
        ) : (
          "-"
        ),
      editable: true,
    },
    {
      field: "title",
      headerName: "Titre",
      width: 160,
      editable: true,
    },
    {
      field: "source",
      headerName: "Source",
      width: 120,
      editable: true,
    },
    {
      field: "description",
      headerName: "Description",
      width: 200,
      editable: true,
    },
    {
      field: "video_url",
      headerName: "Vidéo",
      width: 200,
      renderCell: (params) =>
        params.value ? (
          <video src={params.value} controls width={120} height={60} />
        ) : (
          "-"
        ),
      editable: true,
    },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: "auto", padding: 16 }}>
      <h2>Importation Professionnelle de Films</h2>
      <input
        ref={fileInput}
        type="file"
        accept=".json"
        style={{ margin: "16px 0" }}
        onChange={handleFile}
      />
      {films.length > 0 && (
        <DataGrid
          rows={films}
          columns={columns}
          checkboxSelection
          disableRowSelectionOnClick
          processRowUpdate={processRowUpdate}
          onRowSelectionModelChange={setSelected}
          rowSelectionModel={selected}
          pageSizeOptions={[5, 10, 20, 100]}
          autoHeight
          sx={{ background: "#fff", mb: 2 }}
        />
      )}
      <div style={{ margin: "16px 0" }}>
        <Button
          variant="contained"
          color="error"
          onClick={() => handleDelete(selected)}
          disabled={selected.length === 0}
          sx={{ mr: 2 }}
        >
          Supprimer la sélection
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={selected.length === 0}
          onClick={handleImport}
        >
          Importer la sélection ({selected.length})
        </Button>
      </div>
      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirmer l’import</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`Importer ${selected.length} films ? Cette action est irréversible.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Annuler</Button>
          <Button onClick={doImport} autoFocus variant="contained" color="primary">
            Oui, importer
          </Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar Feedback */}
      <Snackbar
        open={feedback.open}
        autoHideDuration={6000}
        onClose={() => setFeedback((f) => ({ ...f, open: false }))}
      >
        <Alert
          onClose={() => setFeedback((f) => ({ ...f, open: false }))}
          severity={feedback.sev}
          sx={{ width: "100%" }}
        >
          {feedback.msg}
        </Alert>
      </Snackbar>
    </div>
  );
}

// NOTE : 
// Installer Material UI et DataGrid si ce n'est pas déjà fait :
// npm install @mui/material @mui/x-data-grid @emotion/react @emotion/styled