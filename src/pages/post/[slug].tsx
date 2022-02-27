/* eslint-disable no-shadow */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable consistent-return */
/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */
/* eslint-disable react/no-danger */
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import Image from 'next/image';
import Prismic from '@prismicio/client';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Comments from '../../components/Comments';

interface Post {
  last_publication_date: string;
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

interface NavigationPost {
  title: string;
  uid: string;
}

interface PostProps {
  post: Post;
  titleAndUidNavigationPosts: NavigationPost[];
  preview: boolean;
}

export default function Post({
  post,
  titleAndUidNavigationPosts,
  preview,
}: PostProps): JSX.Element {
  const router = useRouter();

  const [navigationPosts, setNavigationPosts] = useState<NavigationPost[]>([]);

  useEffect(() => {
    setNavigationPosts(titleAndUidNavigationPosts);
  }, [titleAndUidNavigationPosts]);

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

  const formatedDate = format(
    new Date(post.first_publication_date),
    'dd MMM yyyy',
    {
      locale: ptBR,
    }
  );

  const postEditedDate = format(
    new Date(post.last_publication_date),
    "dd MMM yyyy, 'às' hh:mm",
    {
      locale: ptBR,
    }
  );

  const totalWords = post.data.content.reduce(
    (total: number, contentItem): number => {
      total += contentItem.heading.split(' ').length;

      const bodyWords = contentItem.body.map(
        item => item.text.split(' ').length
      );

      bodyWords.map(word => (total += word));

      return total;
    },
    0
  );

  const estimatedTimeInMinutes = Math.ceil(totalWords / 200);

  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling</title>
      </Head>
      <Header />
      <div className={styles.banner}>
        <img src={post.data.banner.url} alt="Banner" />
      </div>
      <div className={styles.postContainer}>
        <div className={styles.postContent}>
          <h1>{post.data.title}</h1>
          <div>
            <FiCalendar color="#BBBBBB" />
            <time className={styles.publicationDate}>{formatedDate}</time>

            <FiUser color="#BBBBBB" />
            <span>{post.data.author}</span>

            <FiClock color="#BBBBBB" />
            <time>{estimatedTimeInMinutes} min</time>
          </div>
          <time className={styles.editedTime}>
            {post.first_publication_date === post.last_publication_date
              ? ''
              : `* editado em ${postEditedDate}`}
          </time>
          {post.data.content.map(content => (
            <article key={content.heading}>
              <h2>{content.heading}</h2>
              <div
                className={styles.content}
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(content.body),
                }}
              />
            </article>
          ))}
        </div>
      </div>
      <div className={styles.line} />
      {navigationPosts?.length === 2 ? (
        <div className={styles.postsNavigation}>
          <div>
            <p>{navigationPosts[1].title}</p>
            <Link href={`/post/${navigationPosts[1].uid}`}>
              <a>Post anterior</a>
            </Link>
          </div>
          <div>
            <p>{navigationPosts[0].title}</p>
            <Link href={`/post/${navigationPosts[0].uid}`}>
              <a className={styles.proximo}>Próximo post</a>
            </Link>
          </div>
        </div>
      ) : (
        ''
      )}
      <Comments />
      {preview && (
        <aside>
          <Link href="/api/exit-preview">
            <a className={commonStyles.preview}>Sair do modo Preview</a>
          </Link>
        </aside>
      )}
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts'),
  ]);

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref || null,
  });

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body],
        };
      }),
    },
  };

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

  // eslint-disable-next-line no-shadow
  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
      first_publication_date: post.first_publication_date,
    };
  });

  const postSelected = posts.find(selected => selected.uid === post.uid);

  const selectedIndex = posts.indexOf(postSelected);

  const navigationPosts = [posts[selectedIndex - 1], posts[selectedIndex + 1]];

  try {
    const titleAndUidNavigationPosts: NavigationPost[] = navigationPosts?.map(
      post => {
        return {
          title: post.data.title,
          uid: post.uid,
        };
      }
    );

    return {
      props: {
        post,
        titleAndUidNavigationPosts,
      },
    };
  } catch (error) {
    return {
      props: {
        post,
        preview,
      },
    };
  }
};
