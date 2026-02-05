/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import type { Metadata } from 'next';

import config from '@payload-config';
import { RootPage, generatePageMetadata } from '@payloadcms/next/views';

import { importMap } from '../importMap.js';

type Args = {
  params: Promise<{
    segments: string[];
  }>;
  searchParams: Promise<{
    [key: string]: string | string[];
  }>;
};

import { Suspense } from 'react';
import { cookies } from 'next/headers';

export const generateMetadata = async ({ params, searchParams }: Args): Promise<Metadata> => {
  await cookies();
  return generatePageMetadata({ config, params, searchParams });
};

const Page = ({ params, searchParams }: Args) => (
  <Suspense fallback={null}>
    <RootPage config={config} importMap={importMap} params={params} searchParams={searchParams} />
  </Suspense>
);

export default Page;
