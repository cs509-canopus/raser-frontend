import styles from "./page.module.css";
import RubricDesignerDashboard from "./RubricDesignerDashboard";
import JournalEditorDashboard from "./JournalEditorDashboard"
import RootLayout from "./layout";

export default function Home() {
  return (
    <div className={styles.page}>
      <JournalEditorDashboard />
    </div>
  );
}
