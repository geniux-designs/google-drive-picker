import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Sandbox app</h1>
      </main>
    </div>
  );
}