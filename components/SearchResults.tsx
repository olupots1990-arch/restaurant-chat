import React from 'react';
import { ChatMessage, MessageAuthor } from '../types';

interface SearchResultsProps {
  summary: string;
  results: ChatMessage[];
  isLoading: boolean;
  query: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({ summary, results, isLoading, query }) => {
  const highlightQuery = (text: string, query: string) => {
    if (!query) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-yellow-400 dark:bg-yellow-600 text-black rounded px-1">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-100 dark:bg-whatsapp-bg/80 dark:[background-image:url('https://i.imgur.com/pYmE0NC.png')]">
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-whatsapp-teal"></div>
        </div>
      ) : query ? (
        <>
          {summary && (
            <div className="mb-4 p-3 rounded-lg bg-white dark:bg-whatsapp-incoming-bubble shadow">
              <h3 className="text-sm font-semibold mb-1 text-gray-800 dark:text-gray-200">AI Summary</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{summary}</p>
            </div>
          )}

          {results.length > 0 ? (
            results.map((message) => (
              <div key={message.id} className="mb-2 p-2 rounded-lg bg-white dark:bg-whatsapp-incoming-bubble/80 backdrop-blur-sm shadow-sm border border-black/10">
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span className={`font-bold ${message.author === MessageAuthor.USER ? 'text-green-600 dark:text-green-400' : 'text-blue-500 dark:text-blue-400'}`}>
                    {message.author === MessageAuthor.USER ? 'You' : "Stanley's Cafeteria"}
                  </span>
                  <span>{message.timestamp}</span>
                </div>
                <div>
                  {message.parts.filter(p => p.type === 'text').map((part, index) => (
                    <p key={index} className="text-gray-800 dark:text-gray-200 text-sm">
                      {highlightQuery(part.content, query)}
                    </p>
                  ))}
                </div>
              </div>
            ))
          ) : (
             <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                <p>No messages found for "{query}".</p>
             </div>
          )}
        </>
      ) : (
         <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
            <p>Enter a search term above to find messages.</p>
         </div>
      )}
    </div>
  );
};

export default SearchResults;
