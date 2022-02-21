import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <div className={styles.header}>
      <Link href="/">
        <a>
          <Image
            className={styles.logo}
            src="/logo.svg"
            alt="logo"
            width="239px"
            height="27px"
          />
        </a>
      </Link>
    </div>
  );
}
