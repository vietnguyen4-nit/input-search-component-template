import { ChangeEventHandler, useCallback, useRef, useState } from 'react';
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
  const [state, setState] = useState<{
    type: 'initital' | 'fetching' | 'success' | 'error';
    message?: string;
  }>({ type: 'initital' });

  const fetchIdRef = useRef(0);

  const loadData = async (searchValue: string) => {
    const currentFetchId = ++fetchIdRef.current;
    try {
      setState({
        type: 'fetching',
      });
      const result = await fetchData(searchValue);
      if (currentFetchId === fetchIdRef.current) {
        setState({
          type: 'success',
        });
        if (!result.length) {
          setListData([]);
        } else {
          setListData(result);
        }
      }
    } catch (error) {
      if (currentFetchId === fetchIdRef.current) {
        setListData([]);
        setState({
          type: 'error',
          message: error as string,
        });
      }
    }
  };

  const handleChangeInput: ChangeEventHandler<HTMLInputElement> = (e) => {
    const searchVal = e.target.value.trim();
    if (!searchVal) {
      fetchIdRef.current++;
      setListData([]);
      setState({ type: 'initital' });
      return;
    }
    loadData(searchVal);
  };

  const isShowSearchResult = () => {
    return state.type !== 'initital';
  };

  // Your code start here
  return (
    <div className="input-search-container">
      <input
        className="input"
        type="text"
        placeholder={placeholder}
        onChange={debounce(handleChangeInput, 500)}
      />
      {isShowSearchResult() && (
        <div className="search-result">
          {state.type === 'success' && (
            <>
              {listData.length > 0 ? (
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
              ) : (
                <p className="no-result"> No result</p>
              )}
            </>
          )}

          {state.type === 'fetching' && <Loader />}

          {state.type === 'error' && (
            <div className="error-message">{state.message}</div>
          )}
        </div>
      )}
    </div>
  );
  // Your code end here
};

export default Input;
