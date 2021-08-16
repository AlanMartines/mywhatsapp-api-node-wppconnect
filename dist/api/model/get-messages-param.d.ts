/**
 * Parâmetros para retorno de mensagens
 */
export interface GetMessagesParam {
    /**
     * Quantidade de mensagens para retornar
     * informar `-1` para trazer tudo (Pode demorar e travar a interface)
     *
     * @default 20
     */
    count?: number;
    /**
     * ID da última mensagem para continuar a busca
     * Isso funciona como paginação, então ao pegar um ID,
     * você pode utilizar para obter as próximas mensagens a partir dele
     */
    id?: string;
    fromMe?: boolean;
    /**
     * Se você deseja recuperar as mensagems antes(before) ou depois(after)
     * do ID informado.
     *
     * @default 'before'
     */
    direction?: 'before' | 'after';
}
