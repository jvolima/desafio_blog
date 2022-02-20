import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import Image from 'next/image';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  return (
    <>
      <Header />
      <div className={styles.banner}>
        <img src={post.data.banner.url} alt="Banner" />
      </div>
      <div className={styles.postContainer}>
        <div className={styles.postContent}>
          <h1>{post.data.title}</h1>
          <div>
            <FiCalendar color="#BBBBBB" />
            <time className={styles.publicationDate}>
              {post.first_publication_date}
            </time>

            <FiUser color="#BBBBBB" />
            <span>{post.data.author}</span>

            <FiClock color="#BBBBBB" />
            <time>4 min</time>
          </div>
        </div>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  // const prismic = getPrismicClient();
  // const posts = await prismic.query(TODO);

  return {
    paths: [],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post: Post = {
    first_publication_date: format(
      new Date(response.first_publication_date),
      'PP',
      {
        locale: ptBR,
      }
    ),
    data: {
      title: response.data.title,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: {
            text: content.body,
          },
        };
      }),
    },
  };

  console.log(post.data.banner.url);

  return {
    props: {
      post,
    },
    revalidate: 60 * 10, // 10 minutos
  };
};
