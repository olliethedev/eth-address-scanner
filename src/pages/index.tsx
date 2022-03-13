import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';

import { fetchTransactions } from '@/lib/API';

import Button from '@/components/buttons/Button';
import Layout from '@/components/layout/Layout';
import Seo from '@/components/Seo';
import Table from '@/components/Table';

interface Transaction {
  asset: string;
  blockNum: string;
  from: string;
  to: string;
  value: string;
  rawContract: {
    address: string;
    decimal: string;
    value: string;
  };
  hash: string;
}

export default function HomePage() {
  const router = useRouter();
  const { apiKeyInput } = router.query;
  const [address, setAddress] = useState<string>('');
  const [key, setKey] = useState<string>(
    (apiKeyInput as string | undefined) ?? ''
  );
  const [addressCount, setAddressCount] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] =
    useState<boolean>(false);
  const [fromBlock, setFromBlock] = useState<string>('');
  const [toBlock, setToBlock] = useState<string>('');

  useEffect(() => {
    if (apiKeyInput && apiKeyInput !== key) {
      setKey(apiKeyInput as string);
    }
  }, [apiKeyInput, key]);
  useEffect(() => {
    if (address) {
      setAddressCount(address.trim().split(/\s+/).length);
    }
  }, [address]);
  const onFetchData = useCallback(() => {
    if (!key || key.length === 0) {
      alert('Missing API key');
      return;
    } else if (!address || address.length === 0) {
      alert('Missing address');
      return;
    } else if (!fromBlock || fromBlock.length === 0) {
      alert('Missing from block');
      return;
    } else if (!toBlock || toBlock.length === 0) {
      alert('Missing to block');
      return;
    }
    const load = async () => {
      setLoadingTransactions(true);
      const transfers = [];
      const addresses = address.trim().split(/\s+/);
      try {
        for (let i = 0; i < addresses.length; i++) {
          const address = addresses[i];
          const data = await fetchTransactions(
            address,
            key,
            parseInt(fromBlock),
            parseInt(toBlock)
          );
          if (data.error) {
            alert('Api error: ' + data.error.message);
          } else {
            if (data.result.transfers.length > 0) {
              // eslint-disable-next-line no-console
              console.log(data.result.transfers);
              transfers.push(...data.result.transfers);
            }
          }
        }
        setTransactions(transfers);
      } catch (error) {
        alert('Api error: ' + error);
        setLoadingTransactions(false);
      }
      setLoadingTransactions(false);
    };
    load();
  }, [address, key, fromBlock, toBlock]);

  return (
    <Layout>
      <Seo templateTitle='Home' />

      <main className='mx-auto flex max-w-5xl flex-col items-center space-y-8 bg-white'>
        <div className='flex w-full flex-col space-y-4'>
          <h1 className='mt-4'>Scanner</h1>
          <div>
            <label className='mt-4 mr-2'>API Key:</label>
            <input
              className='border-2'
              placeholder='Enter API Key'
              name='apiKey'
              type='text'
              value={key}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setKey(e.target.value)
              }
            />
          </div>
          <div className='flex space-x-4'>
            <div>
              <label className='mt-4 mr-2'>From Block:</label>
              <input
                className='border-2'
                placeholder='Enter Block Number'
                type='number'
                name='fromBlock'
                value={fromBlock}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFromBlock(e.target.value)
                }
              />
            </div>
            <div>
              <label className='mt-4 mr-2'>To Block:</label>
              <input
                className='border-2'
                placeholder='Enter Block Number'
                type='number'
                name='toBlock'
                value={toBlock}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setToBlock(e.target.value)
                }
              />
            </div>
          </div>
          <label className='mt-4'>Addresses:</label>
          <textarea
            className='border-2'
            placeholder='Enter an space separated addresses'
            name='firstName'
            value={address}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setAddress(e.target.value)
            }
          />
          <span className='text-sm'>You entered {addressCount} addresses</span>
          <div>
            <Button
              isLoading={loadingTransactions}
              className='mt-2'
              variant='dark'
              onClick={onFetchData}
            >
              Load Data
            </Button>
          </div>
        </div>
        {transactions && (
          <Table
            columns={[
              {
                Header: 'Block',
                accessor: 'col1',
              },
              {
                Header: 'From',
                accessor: 'col2',
                Cell: ({ row }) => <a href=''>{row.original.col2}</a>,
              },
              {
                Header: 'To',
                accessor: 'col3',
              },
              {
                Header: 'Contract',
                accessor: 'col6',
              },
              {
                Header: 'Asset',
                accessor: 'col4',
              },
              {
                Header: 'Value',
                accessor: 'col5',
              },
              {
                Header: 'Hash',
                accessor: 'col7',
              },
            ]}
            data={transactions.map((tx) => ({
              col1: parseInt(tx.blockNum, 16).toString(),
              col2: tx.from,
              col3: tx.to,
              col6: tx.rawContract?.address ? tx.rawContract?.address : 'No',
              col4: tx.asset,
              col5: tx.value,
              col7: tx.hash,
            }))}
          />
        )}
      </main>
    </Layout>
  );
}
