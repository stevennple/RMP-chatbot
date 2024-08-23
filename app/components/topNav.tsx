'use client';
import React from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Icon from '@/data/icon.png';
import { Button } from './ui/button';


export function TopNav() {
  const router = useRouter();

  return (
    <nav className="flex w-full items-center justify-between border-b p-4 text-xl font-semibold bg-white h-16 fixed top-0 left-0 right-0">
      <Image src={Icon} alt="Site Logo" width={150} height={150} />
      <SignedIn>
        <div className="flex space-x-4">
          {/* <button onClick={() => router.push('/')} className="hover:text-gray-300">XYZ</button>
          <button onClick={() => router.push('/history')} className="hover:text-gray-300">History</button>
          <button onClick={() => router.push('/inventory')} className="hover:text-gray-300">Current</button> 
          <h1 className="text-2xl font-bold text-slate-900">XYZ</h1>*/}
        </div>
      </SignedIn>
      <SignedOut>
        <div className="flex-grow"></div>
      </SignedOut>

      <div>
        <SignedOut>
          <SignInButton>
            <button className="bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-950">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <div className='flex items-center space-x-4'>
            <Button variant='white' onClick={() => router.push('/subscription')} className="hover:text-gray-300 ">
              Subscription
            </Button>
            <UserButton />
          </div>
        </SignedIn>
      </div>
    </nav>
  );
}
