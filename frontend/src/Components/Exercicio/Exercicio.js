import React from 'react';
import ReactDataGrid from '@inovua/reactdatagrid-community';
import '@inovua/reactdatagrid-community/index.css';
import Head from '../Helper/Head';
import useFetch from "./../../Hooks/useFetch";
import { EXERCICIOS_GET, EXERCICIOS_DELETE, EXERCICIO_POST, EXERCICIO_PUT, GRUPOS_GET, EQUIPAMENTOS_GET } from "./../../api";
import Button from '../Forms/Button';
import ModalForm from './../Helper/ModalForm';
import Input from '../Forms/Input';
import useForm from "../../Hooks/useForm";
import Error from '../Helper/Error';
import Select from '../Forms/Select';
import Multiselect from '../Forms/Multiselect';

const Exercicio = () => {

    const {data, loading, error, request } = useFetch(); // datagrid
    const {data: dataModalData, loading: loadingModalData, error: errorModalData, request: requestModalData, clearError } = useFetch(); // modal
    
    const [exercicioData, setExercicioData] = React.useState([]);
    const [exercicioDataAdapter, setExercicioDataAdapter] = React.useState([]);
    const [modalForm, setModalForm] = React.useState(null);

    const [grupoMuscular, setgrupoMuscular] = React.useState([]); // for the select component
    const [equipamentosDisponiveis, setEquipamentosDisponiveis] = React.useState([]); // for the select component

    const [gridRef, setGridRef] = React.useState(null)
    const propsRef = React.useRef(null);
    propsRef.current = gridRef && gridRef.current;

    const [activeIndex, setActiveIndex] = React.useState(null);

    /* Form items */
    const descricao = useForm();
    const modalidade = useForm();
    const [grupo, setGrupo] = React.useState({});
    const [equipamentos, setEquipamentos] = React.useState([]);
    const modoExecucao = useForm();
    /* End - Form items */

    React.useEffect( () => {
        async function fetchEquipamentos () {
            const token = window.localStorage.getItem('token');
            const { url, options } = EQUIPAMENTOS_GET(token);
            const { response, json } = await request(url, options);
            if(response && response.ok){
                setEquipamentosDisponiveis(json.map(item => {
                    return {
                        value: item.id, label: item.descricao
                    };
                }));
            }
        }
        fetchEquipamentos();
    }, []);

    React.useEffect( () => {

        async function fetchGrupos () {
            const token = window.localStorage.getItem('token');
            const { url, options } = GRUPOS_GET(token);
            const { response, json } = await request(url, options);
            if(response && response.ok){
                setgrupoMuscular(json);
            }
        }
        fetchGrupos();
    }, []);

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

        //Default modalidade
        modalidade.setValue(1);

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
        descricao.setValue('');
        modoExecucao.setValue('');
        modalidade.setValue('');
        setGrupo({});
    }
    function loadModalData(){
        clearError();
        if(modalForm === 'Editar'){
            const item = propsRef.current.getItemAt(activeIndex);
            if(item){
                descricao.setValue(item.descricao);
                modoExecucao.setValue(item.modo_execucao);
                modalidade.setValue(item.modalidade.id);
                setGrupo(item.grupo.id);
            }
        }else if(modalForm === 'Novo'){
            modalidade.setValue(1); //default modalidade
        }
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

        try {

            if(modalForm === 'Novo'){
                const token = window.localStorage.getItem('token');
                const { url, options } = EXERCICIO_POST( { 
                    modalidade_id: modalidade.value,
                    descricao: descricao.value,
                    modo_execucao: modoExecucao.value,
                    grupoExercicio_id: grupo,
                    equipamentos: []
                } , token);
                const { response, json } = await requestModalData(url, options);
                if(response && response.ok){
                    setExercicioData([...exercicioData, json]);
                    setModalForm(null);
                }
            } else if(modalForm === 'Editar'){
                const currentItem = propsRef.current.getItemAt(activeIndex);
                const idEdit = currentItem.id;
                const token = window.localStorage.getItem('token');
                const { url, options } = EXERCICIO_PUT( idEdit, { 
                    modalidade_id: modalidade.value,
                    descricao: descricao.value,
                    modo_execucao: modoExecucao.value,
                    grupoExercicio_id: grupo,
                    equipamentos: []
                } , token);
                const { response, json } = await requestModalData(url, options);
                if(response && response.ok){
                    setExercicioData(exercicioData.map(item => {
                        if (item.id === json.id) {
                          return { ...item, ...json };
                        } else {
                          return item;
                        }
                    }));
                    setModalForm(null);
                }
            }

        } catch(e){
            console.log("error ==== ", e);
        }

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
                <Input label="Exercício" type="text" name="nome" {...descricao} />
                <Input label="Modo de Execução" type="text" name="modo" {...modoExecucao} />
                <Select label="Grupo" name="grupo" value={grupo} setValue={setGrupo} options={grupoMuscular} />
                <Multiselect label="Equipamentos" name="equipamentos" value={equipamentos} setValue={setEquipamentos} options={equipamentosDisponiveis} />
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