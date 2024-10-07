import { ChangeEventHandler, useRef, useState } from 'react';
import { debounce } from '../../utils/deboucne';
import { fetchData } from '../../utils/fetch-data';
import Loader from '../Loader';
import './input.scss';

export interface InputProps {
  /** Placeholder of the input */
  placeholder?: string;
  /** On click item handler */
  onSelectItem: (item: string) => void;
}

const Input = ({ placeholder, onSelectItem }: InputProps) => {
  // DO NOT remove this log
  console.log('input re-render');
  const [listData, setListData] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'info' | 'error';
    message: string;
  } | null>(null);

  const fetchIdRef = useRef(0);

  const loadData = async (searchValue: string) => {
    const currentFetchId = ++fetchIdRef.current;
    try {
      setIsLoading(true);
      const result = await fetchData(searchValue);
      if (currentFetchId === fetchIdRef.current) {
        if (!result.length) {
          setMessage({
            type: 'info',
            message: 'No result',
          });
          setListData([]);
        } else {
          setListData(result);
          setMessage(null);
        }
      }
    } catch (error) {
      if (currentFetchId === fetchIdRef.current) {
        setListData([]);
        setMessage({
          type: 'error',
          message: error as string,
        });
      }
    } finally {
      if (currentFetchId === fetchIdRef.current) setIsLoading(false);
    }
  };

  const handleChangeInput: ChangeEventHandler<HTMLInputElement> = (e) => {
    const searchVal = e.target.value.trim();
    if (!searchVal) {
      fetchIdRef.current++;
      setListData([]);
      setMessage(null);
      setIsLoading(false);
      return;
    }
    loadData(searchVal);
  };

  const isShowSearchResult = () => {
    return listData.length > 0 || message || isLoading;
  };

  // Your code start here
  return (
    <div className="input-search-container">
      <input
        className="input"
        type="text"
        placeholder={placeholder}
        onChange={debounce(handleChangeInput, 100)}
      />
      {isShowSearchResult() && (
        <div className="search-result">
          {listData.length > 0 && !isLoading && (
            <div className="lists">
              {listData.map((item, index) => (
                <div
                  className="item"
                  key={index}
                  onClick={() => onSelectItem(item)}
                >
                  {item}
                </div>
              ))}
            </div>
          )}

          {isLoading && <Loader />}

          {message?.type === 'info' && (
            <p className="no-result"> {message.message}</p>
          )}
          {message?.type === 'error' && (
            <div className="error-message">{message.message}</div>
          )}
        </div>
      )}
    </div>
  );
  // Your code end here
};

export default Input;
