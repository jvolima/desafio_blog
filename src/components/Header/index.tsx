import Image from 'next/image';
import { useRouter } from 'next/router';
import styles from './header.module.scss';

export default function Header(): JSX.Element {
  const routes = useRouter();

  const handleClickLogo = (): void => {
    routes.push('/');
  };

  return (
    <div className={styles.header}>
      <Image
        className={styles.logo}
        src="/logo.svg"
        alt="logo"
        width="239px"
        height="27px"
        onClick={handleClickLogo}
      />
    </div>
  );
}
