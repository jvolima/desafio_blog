import Image from 'next/image';
import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <div className={styles.header}>
      <Image src="/logo.svg" alt="logo" width="239px" height="27px" />
    </div>
  );
}
