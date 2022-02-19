import { GetStaticProps } from 'next';
import Image from 'next/image';
import Prismic from '@prismicio/client';
import Link from 'next/link';

import { FiCalendar, FiUser } from 'react-icons/fi';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  return (
    <>
      <header className={styles.homeHeader}>
        <Image src="/logo.svg" alt="logo" width="239px" height="27px" />
      </header>
      <div className={styles.homeContainer}>
        <div className={styles.homeContent}>
          {postsPagination.results.map(post => (
            <Link href={`post/${post.uid}`}>
              <a key={post.uid}>
                <h1>{post.data.title}</h1>
                <h2>{post.data.subtitle}</h2>
                <div>
                  <FiCalendar color="#BBBBBB" />
                  <time>{post.first_publication_date}</time>
                  <FiUser color="#BBBBBB" />
                  <span>{post.data.author}</span>
                </div>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: [
        'posts.title',
        'posts.subtitle',
        'posts.author',
        'posts.first_publication_date',
      ],
      pageSize: 100,
    }
  );

  const posts: Post[] = postsResponse.results.map(post => {
    return {
      slug: post.uid,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
      first_publication_date: format(
        new Date(post.first_publication_date),
        'PP',
        {
          locale: ptBR,
        }
      ),
    };
  });

  const postsPagination: PostPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  };

  return {
    props: {
      postsPagination,
    },
  };
};
