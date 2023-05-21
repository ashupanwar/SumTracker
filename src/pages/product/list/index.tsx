import { FC, useEffect, useState,useRef } from "react";
import ResultString from "../../../components/content/result.content";
import Heading from "../../../components/heading/basic.heading";
import Pagination from "../../../components/pagination/basic.pagination";
import { PAGINATION_LIMIT } from "../../../constants/app.constants";
import { PaginateDataType, UrlType } from "../../../interface/common";
import { listProducts } from "../../../services/products";
import { listContacts } from "../../../services/contacts";
import { getQueryFromUrl } from "../../../utils/common.utils";
import ProductsTable from "./components/products.table";
import { useSearchParams } from "react-router-dom";



const fixedListParams = {
    paginate: true
}





const ProductList: FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const [products, setProducts] = useState<any[]>([]);
    const [contacts, setContacts] = useState<any[]>([]);

    const [selectedContact, setSelectedContact] = useState<any>({code:''});
    const [displayContactTable,setDisplayContactTable] = useState<any>(false);
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

    const [loading, setLoding] = useState<boolean>(false);
    const [pagination, setPagination] = useState<PaginateDataType>({
        next: null,
        prev: null,
        count: null,
        resultsCount: 0,
        offset: null,
        hasOffset: true,
        limit: PAGINATION_LIMIT
    });

    function useOutsideAlerter(ref:any) {
        useEffect(() => {
            function handleClickOutside(event:any) {
            if (ref.current && !ref.current.contains(event.target)) {
                setShowSuggestions(false)
            }
            }
            document.addEventListener("mousedown", handleClickOutside);
            return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            };
        }, [ref]);
    }

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        loadProducts();
    }
    const handleFocus = () => {
        loadContacts();
    }

    const loadContacts = async (queryParams?: Record<string, any>) => {
        let query = queryParams || {};
        try {
            const res = await listContacts({
                query: { ...query }
            });

            setContacts(res.data.results);
            setShowSuggestions(true);

        } catch (err) {
            console.log(err);
        }
    }
    const loadProducts = async (queryParams?: Record<string, any>) => {
        let query = queryParams || {};
        setLoding(true);
        try {
            const res = await listProducts({
                query: { ...fixedListParams, ...query }
            });

            setProducts(res.data.results);
            setPagination(prev => {
                return {
                    ...prev,
                    next: res.data.next,
                    prev: res.data.previous,
                    count: res.data.count,
                    resultsCount: res.data.results.length,
                    offset: query?.offset ? Number(query.offset) : null,
                }
            });

        } catch (err) {
            console.log(err);
        }
        setLoding(false);
    }

    const handleNext = (next: UrlType) => {
        if (next === null) {
            return;
        }
        let query = getQueryFromUrl(next);
        loadProducts(query);
    }

    const handlePrev = (prev: UrlType) => {
        if (prev === null) {
            return;
        }
        let query = getQueryFromUrl(prev);
        loadProducts(query);
    }

    useEffect(()=>{
        let id = searchParams.get('contact')
        loadProducts({
            contacts:id
        })
    },[])

    useEffect(()=>{
        if(selectedContact.code){
            setSearchParams({contact:selectedContact.id})
            loadProducts({
                contacts:selectedContact.id
            })
            setShowSuggestions(false)
        }
        
    },[selectedContact])
    
    const wrapperRef = useRef(null);
    useOutsideAlerter(wrapperRef);
     
     
        return (
            <>
                <div style={{ marginBottom: '1rem' }}>
                    <Heading
                        titleLevel={2}
                    >
                        
                        <div style={{display:'flex'}}>
                            Products
                            <div style={{marginLeft:'10px', position:'relative', width:'200px'}}>
                                <input value={selectedContact?.code} type="text" onFocus={()=>{handleFocus()}} style={{width:'100%'}} onChange={(e)=>{setSelectedContact(e.target.value)}}/>
                                {contacts.length && showSuggestions ? (
                                    <div 
                                        ref={wrapperRef}
                                        style={{width:'100%',maxHeight:'300px',padding:"6px 6px",overflow:'scroll',position:'absolute',top:'40px',zIndex:'10' ,backgroundColor:"white", border:"1px solid blue"}}
                                    >
                                        <ul style={{width:'100%', listStyle:'none',fontSize:'10px', }}>
                                            {contacts.map(elem=>(
                                                <li key={elem.id} style={{margin:'0', marginBottom:'20px',color:"black", cursor:"pointer"}} onClick={(e)=>{setSelectedContact(elem); }}>
                                                    <p style={{margin:"0px"}}>{elem.code}</p>
                                                    <p style={{margin:"0px"}}>Company Name: {elem.company_name}</p>
                                                </li>
                                            ))}
                                            
                                        </ul>
                                    </div>
                                ) : ""
                                }
                                    
                            </div>
                        </div>
                    </Heading>
                </div>
                
                <div style={{ backgroundColor: 'white', padding: '0.5rem'}} >
                    <div style={{ marginBottom: '1rem' }}>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <div>
                                <ResultString
                                    loading={loading}
                                    pagination={pagination}
                                    pageString={'product'}
                                />
                            </div>
                            <div>
                                <Pagination
                                    next={pagination.next}
                                    prev={pagination.prev}
                                    onNextClick={handleNext}
                                    onPrevClick={handlePrev}
                                />
                            </div>
                        </div>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <ProductsTable
                            list={products}
                            loading={loading}
                        />
                    </div>
                    <div>
                        <Pagination
                            next={pagination.next}
                            prev={pagination.prev}
                        />
                    </div>
                </div>
                
                
            </>)
     
}

export default ProductList;