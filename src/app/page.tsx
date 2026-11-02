import styles from "./page.module.css";
import RubricDesignerDashboard from "./RubricDesignerDashboard";
import RootLayout from "./layout";

export default function Home() {
  return (
    <div className={styles.page}>
      <RubricDesignerDashboard />
    </div>
  );
}
