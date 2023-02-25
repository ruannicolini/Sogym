import React from 'react';
import ReactDataGrid from '@inovua/reactdatagrid-community';
import '@inovua/reactdatagrid-community/index.css';
import Head from '../Helper/Head';
import useFetch from "./../../Hooks/useFetch";
import { EXERCICIOS_GET, EXERCICIOS_DELETE, EQUIPAMENTOS_POST, EQUIPAMENTOS_PUT } from "./../../api";
import Button from '../Forms/Button';
import ModalForm from './../Helper/ModalForm';
import Input from '../Forms/Input';
import useForm from "../../Hooks/useForm";
import Error from '../Helper/Error';

const Exercicio = () => {

    const {data, loading, error, request } = useFetch(); // datagrid
    const {data: dataModalData, loading: loadingModalData, error: errorModalData, request: requestModalData, clearError } = useFetch(); // modal
    
    const [exercicioData, setExercicioData] = React.useState([]);
    const [exercicioDataAdapter, setExercicioDataAdapter] = React.useState([]);
    const [modalForm, setModalForm] = React.useState(null);

    const [gridRef, setGridRef] = React.useState(null)
    const propsRef = React.useRef(null);
    propsRef.current = gridRef && gridRef.current;

    const [activeIndex, setActiveIndex] = React.useState(null);

    /* Form items */
    const descricao = useForm();
    //const modalidade = useForm();
    const grupo = useForm();
    const modoExecucao = useForm();
    /* End - Form items */

    React.useEffect( () => {
        async function fetchExercicios () {
            const token = window.localStorage.getItem('token');
            const { url, options } = EXERCICIOS_GET(token);
            const { response, json } = await request(url, options);
            if(response && response.ok){
                setExercicioData(json);
            }
        }
        fetchExercicios();
    }, []);
    
    React.useEffect( () => {

        //Adapter data from api
        setExercicioDataAdapter(exercicioData.map(item => {
            return {...item, ...{"grupo_descricao": item.grupo.descricao}};
        }));

        if(exercicioDataAdapter){
            setActiveIndex(0);
        }

    }, [exercicioData]);

    function clearFormItems(){
        // descricao.setValue('');
    }
    function loadModalData(){
        // clearError();
        // if(modalForm === 'Editar'){
        //     const item = propsRef.current.getItemAt(activeIndex);
        //     if(item){
        //         descricao.setValue(item.descricao);
        //     }
        // }
    }
    async function handleRemoverClick({target}){
        if( window.confirm("Deseja remover o item?")){
            const idDelete = target.dataset.id;
            const token = window.localStorage.getItem('token');
            const { url, options } = EXERCICIOS_DELETE(idDelete, token);
            const { response, json } = await request(url, options);
            if(response && response.ok){
                const newData = exercicioData.filter((item) => item.id !== Number(idDelete));
                setExercicioData(newData);
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

        // try {

        //     if(modalForm === 'Novo'){
        //         const token = window.localStorage.getItem('token');
        //         const { url, options } = EQUIPAMENTOS_POST( { descricao: descricao.value } , token);
        //         const { response, json } = await requestModalData(url, options);
        //         if(response && response.ok){
        //             setExercicioData([...exercicioData, json]);
        //             setModalForm(null);
        //         }
        //     } else if(modalForm === 'Editar'){
        //         const currentItem = propsRef.current.getItemAt(activeIndex);
        //         const idEdit = currentItem.id;
        //         const token = window.localStorage.getItem('token');
        //         const { url, options } = EQUIPAMENTOS_PUT( idEdit, { descricao: descricao.value } , token);
        //         const { response, json } = await requestModalData(url, options);
        //         if(response && response.ok){
        //             setExercicioData(exercicioData.map(item => {
        //                 if (item.id === json.id) {
        //                   return { ...item, ...json };
        //                 } else {
        //                   return item;
        //                 }
        //             }));
        //             setModalForm(null);
        //         }
        //     }

        // } catch(e){
        //     console.log("error ==== ", e);
        // }

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
        { name: 'descricao', header: 'Exercício', minWidth: 50, defaultFlex: 2 },
        { name: 'grupo_descricao', header: 'Grupo', minWidth: 50, defaultFlex: 2},
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
        { name: 'grupo_descricao', operator: "startsWith", type: 'string'},
    ]

    // define grid styles here
    const gridStyle = { minHeight: 550 };
    
	return (

        <section>

            <Head title = "Exercicios" />

            { (modalForm != null) ? <ModalForm setModalForm={setModalForm} modalForm={modalForm} handleSalvarClick={handleSalvarClick} loadModalData={loadModalData} error={errorModalData}>
                {/* <Input label="Exercicio" type="text" name="nome" {...descricao} /> */}
            </ModalForm> : ''}

            <div>
                
                <ReactDataGrid
                    activeIndex={activeIndex}
                    onActiveIndexChange={onActiveIndexChange}
                    defaultActiveIndex={0}
                    onReady={setGridRef}

                    idProperty="id"
                    columns={columns}
                    dataSource={exercicioDataAdapter}
                    style={gridStyle}
                    defaultFilterValue={filterValue}
                    pagination
                    limit={20}
                    showColumnMenuTool={false}
                    defaultSortingDirection="asc"
                    loading={loading}
                    loadingText={<b>Buscando dados ... </b>}
                />

                <Button onClick={handleNovoClick} style={{ marginTop: '20px', marginBottom: '20px', marginLeft: 'auto', fontWeight: 'bold' }}>Novo</Button>

                <Error error={error} />

            </div>

        </section>

	);
}

export default Exercicio;