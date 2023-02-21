import React from 'react';
import ReactDataGrid from '@inovua/reactdatagrid-community';
import '@inovua/reactdatagrid-community/index.css';
import Head from '../Helper/Head';
import useFetch from "./../../Hooks/useFetch";
import { EQUIPAMENTOS_GET, EQUIPAMENTOS_DELETE, EQUIPAMENTOS_POST, EQUIPAMENTOS_PUT } from "./../../api";
import Button from '../Forms/Button';
import ModalForm from './../Helper/ModalForm';
import Input from '../Forms/Input';
import useForm from "../../Hooks/useForm";

const Equipamento = () => {

    const {data, loading, error, request } = useFetch();
    const [equipamentoData, setEquipamentoData] = React.useState([]);
    const [modalForm, setModalForm] = React.useState(null);

    const [gridRef, setGridRef] = React.useState(null)
    const propsRef = React.useRef(null);
    propsRef.current = gridRef && gridRef.current;

    const [activeIndex, setActiveIndex] = React.useState(null);

    /* Form items */
    const descricao = useForm();
    /* End - Form items */

    React.useEffect( () => {
        async function fetchEquipamentos () {
            const token = window.localStorage.getItem('token');
            const { url, options } = EQUIPAMENTOS_GET(token);
            const { response, json } = await request(url, options);
            if(response && response.ok){
                setEquipamentoData(json);
            }
        }
        fetchEquipamentos();
        if(equipamentoData){
            setActiveIndex(0);
        }
    }, []);

    function clearFormItems(){
        descricao.setValue('');
    }
    function loadModalData(){
        if(modalForm === 'Editar'){
            const item = propsRef.current.getItemAt(activeIndex);
            if(item){
                descricao.setValue(item.descricao);
            }
        }
    }
    async function handleRemoverClick({target}){
        if( window.confirm("Deseja remover o item?")){
            const idDelete = target.dataset.id;
            const token = window.localStorage.getItem('token');
            const { url, options } = EQUIPAMENTOS_DELETE(idDelete, token);
            const { response, json } = await request(url, options);
            if(response && response.ok){
                const newData = equipamentoData.filter((item) => item.id !== Number(idDelete));
                setEquipamentoData(newData);
            }
        }
    }
    function handleNovoClick({target}){
        clearFormItems();
        setModalForm('Novo');
    }
    function handleEditarClick({target}){
        clearFormItems();
        setModalForm('Editar');
    }
    async function handleSalvarClick({target}){

        if(modalForm === 'Novo'){
            const token = window.localStorage.getItem('token');
            const { url, options } = EQUIPAMENTOS_POST( { descricao: descricao.value } , token);
            const { response, json } = await request(url, options);
            if(response && response.ok){
                setEquipamentoData([...equipamentoData, json]);
            }
        } else if(modalForm === 'Editar'){
            const currentItem = propsRef.current.getItemAt(activeIndex);
            const idEdit = currentItem.id;
            const token = window.localStorage.getItem('token');
            const { url, options } = EQUIPAMENTOS_PUT( idEdit, { descricao: descricao.value } , token);
            const { response, json } = await request(url, options);
            if(response && response.ok){
                setEquipamentoData(equipamentoData.map(item => {
                    if (item.id === json.id) {
                      return { ...item, ...json };
                    } else {
                      return item;
                    }
                }));
            }
        }

        setModalForm(null);
    }

    
    const onActiveIndexChange = React.useCallback((index) => {
        if(index !== -1){
            if(propsRef){
                // const item = propsRef.current.getItemAt(index);
                // const rowId = propsRef.current.getItemId(item);
                setActiveIndex(index);
            }
        }
    }, []);

    // define columns
    const columns = [
        { name: 'descricao', header: 'Equipamento', minWidth: 50, defaultFlex: 2 },
        {
            header: '',
            maxWidth: 80,
            render: ({ data}) => <button data-id={data.id} onClick={handleEditarClick}>Editar</button>
        },
        {
            header: '',
            maxWidth: 100,
            render: ({ data}) => <button data-id={data.id} onClick={handleRemoverClick}>Remover</button>
        }
    ];

    // define Filters
    const filterValue = [
        { name: 'descricao', operator: 'startsWith', type: 'string'},
    ]

    // define grid styles here
    const gridStyle = { minHeight: 550 };
    
	return (

        <section>

            <Head title = "Equipamentos" />

            { (modalForm != null) ? <ModalForm setModalForm={setModalForm} modalForm={modalForm} handleSalvarClick={handleSalvarClick} loadModalData={loadModalData}>
                <Input label="Equipamento" type="text" name="nome" {...descricao} />
            </ModalForm> : ''}

            <div>
                
                <ReactDataGrid
                    activeIndex={activeIndex}
                    onActiveIndexChange={onActiveIndexChange}
                    defaultActiveIndex={0}
                    onReady={setGridRef}

                    idProperty="id"
                    columns={columns}
                    dataSource={equipamentoData}
                    style={gridStyle}
                    defaultFilterValue={filterValue}
                    pagination
                    limit={20}
                    showColumnMenuTool={false}
                    defaultSortingDirection="asc"
                />

                <Button onClick={handleNovoClick} style={{ marginTop: '20px', marginBottom: '20px', marginLeft: 'auto', fontWeight: 'bold' }}>Novo</Button>

            </div>

        </section>

	);
}

export default Equipamento;